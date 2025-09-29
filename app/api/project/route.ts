import { connectDB } from '@/src/entities/models/db/mongoose';
import Project from '@/src/entities/models/Project';
import { IDescriptionItem } from '@/src/entities/type/products';
import { uploadImageToR2 } from '@/src/shared/lib/uploadToR2';
import { NextRequest, NextResponse } from 'next/server';

// GET: 모든 프로젝트 조회
export async function GET() {
  await connectDB();

  try {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ 
      success: true, 
      message: '프로젝트 목록을 성공적으로 조회했습니다.', 
      data: projects 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      success: false, 
      message: '프로젝트 목록 조회에 실패했습니다.', 
      error: errorMessage 
    }, { status: 500 });
  }
}

// 새 프로젝트 생성
export async function POST(request: NextRequest) {
  await connectDB();

  try {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const mainImageFile = formData.get('image') as File | null;

    if (!title || !mainImageFile) {
        throw new Error('제목과 대표 이미지는 필수입니다.');
    }

    // 2. 대표 이미지를 클라우드에 업로드하고 URL을 받습니다.
    const mainImageBuffer = Buffer.from(await mainImageFile.arrayBuffer());
    const imageUrl = await uploadImageToR2(mainImageBuffer, mainImageFile.name);

    const description: IDescriptionItem[] = [];
    let index = 0;
    while (formData.has(`description[${index}][itemType]`)) {
        const itemType = formData.get(`description[${index}][itemType]`) as 'image' | 'break';

        if (itemType === 'break') {
            description.push({ itemType: 'break' });
        } else {
            const imageFile = formData.get(`description_image_${index}`) as File | null;
            if (imageFile) {
                // 3. 설명 이미지 파일 처리: File -> Buffer -> R2 업로드
                const descImageBuffer = Buffer.from(await imageFile.arrayBuffer());
                const descImageUrl = await uploadImageToR2(descImageBuffer, imageFile.name);
                description.push({ itemType: 'image', src: descImageUrl });
            }
        }
        index++;
    }

    // 4. 스키마에 맞는 '순수 데이터 객체'를 만듭니다. (파일이 아닌 URL 포함)
    const projectDataToSave = {
        title,
        image: imageUrl, // File 객체가 아닌 String URL
        description,     // File 객체가 아닌 String URL 포함
    };

    // 5. 최종적으로 스키마와 일치하는 객체로 DB에 문서를 생성합니다.
    const project = await Project.create(projectDataToSave);

    return NextResponse.json({ 
        success: true, 
        message: '프로젝트를 성공적으로 생성했습니다.', 
        data: project 
    }, { status: 201 });
  } catch (error: any) {
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
      message: '프로젝트 생성에 실패했습니다.', 
      error: errorMessage 
    }, { status: 500 });
  }
}