import { connectDB } from '@/src/entities/models/db/mongoose';
import Project from '@/src/entities/models/Project';
import { IDescriptionItem } from '@/src/entities/type/products';
import { uploadImageToR2 } from '@/src/shared/lib/uploadToR2';
import { NextRequest, NextResponse } from 'next/server';

interface ParamProps {
  params: Promise<{ id: string }>
}

// ID로 특정 프로젝트 조회
export async function GET(request: NextRequest, { params }: ParamProps) {
  const { id } = await params;
  await connectDB();

  try {
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ 
        success: false, 
        message: '해당 ID의 프로젝트를 찾을 수 없습니다.' 
      }, { status: 404 });
    }
    return NextResponse.json({ 
      success: true, 
      message: '프로젝트를 성공적으로 조회했습니다.', 
      data: project 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      success: false, 
      message: '프로젝트 조회에 실패했습니다.', 
      error: errorMessage 
    }, { status: 500 });
  }
}

// ID로 특정 프로젝트 수정
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();

  try {
    const formData = await request.formData();
    const updateData: { [key: string]: any } = {};

    // 1. 제목 업데이트 (항상 존재)
    const title = formData.get('title') as string;
    if (title) {
        updateData.title = title;
    }

    // 2. 대표 이미지 업데이트 (새 파일이 있을 경우에만)
    const mainImageFile = formData.get('image') as File | null;
    if (mainImageFile) {
        const mainImageBuffer = Buffer.from(await mainImageFile.arrayBuffer());
        const imageUrl = await uploadImageToR2(mainImageBuffer, mainImageFile.name);
        updateData.image = imageUrl; // 새 이미지 URL로 교체
    }

    // 3. 상세 설명 업데이트
    const descriptionString = formData.get('description') as string | null;
    if (descriptionString) {
        const descriptionArrayFromClient = JSON.parse(descriptionString);
        const finalDescription: IDescriptionItem[] = [];

        // for...of 루프와 Promise.all을 사용하여 비동기 업로드를 효율적으로 처리
        for (const item of descriptionArrayFromClient) {
            if (item.itemType === 'break') {
                finalDescription.push({ itemType: 'break' });
            } 
            else if (item.itemType === 'image' && item.src) {
                // 'src'가 'new_image_'로 시작하면 새 파일이므로 업로드
                if (item.src.startsWith('new_image_')) {
                    const imageFile = formData.get(item.src) as File | null;
                    if (imageFile) {
                        const descImageBuffer = Buffer.from(await imageFile.arrayBuffer());
                        const descImageUrl = await uploadImageToR2(descImageBuffer, imageFile.name);
                        finalDescription.push({ itemType: 'image', src: descImageUrl });
                    }
                } else {
                    // 기존 이미지는 URL을 그대로 유지
                    finalDescription.push({ itemType: 'image', src: item.src });
                }
            }
        }
        updateData.description = finalDescription;
    }

    // 4. 최종적으로 정리된 데이터로 DB 문서를 업데이트합니다.
    const updatedProject = await Project.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedProject) {
        return NextResponse.json({ 
            success: false, 
            message: '해당 ID의 프로젝트를 찾을 수 없습니다.' 
        }, { status: 404 });
    }

    return NextResponse.json({ 
        success: true, 
        message: '프로젝트를 성공적으로 수정했습니다.', 
        data: updatedProject 
    });
  } catch (error: any) {
    // 에러 처리 로직은 POST와 동일하게 유지
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        success: false, 
        message: '입력 값에 오류가 있습니다.', 
        error: errorMessage 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      success: false, 
      message: '프로젝트 수정에 실패했습니다.', 
      error: errorMessage 
    }, { status: 500 });
  }
}

// DELETE: ID로 특정 프로젝트 삭제
export async function DELETE(request: NextRequest, { params }: ParamProps) {
  const { id } = await params;
  await connectDB();

  try {
    const deletedProject = await Project.deleteOne({ _id: id });
    if (deletedProject.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        message: '해당 ID의 프로젝트를 찾을 수 없습니다.' 
      }, { status: 404 });
    }
    return NextResponse.json({ 
      success: true, 
      message: '프로젝트를 성공적으로 삭제했습니다.' 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      success: false, 
      message: '프로젝트 삭제에 실패했습니다.', 
      error: errorMessage 
    }, { status: 500 });
  }
}