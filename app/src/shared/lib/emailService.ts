import { EmailResult } from "@/src/components/order/interface";
import { OrderData, ShippingStatus } from "@/src/entities/type/interfaces";
import nodemailer, { Transporter } from "nodemailer";

export class EmailService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    async sendOrderNotification(orderData: OrderData): Promise<EmailResult> {
        try {
            const mailOptions = {
                from: `"${process.env.STORE_NAME || "온라인 스토어"}" <${process.env.SMTP_USER}>`,
                to: process.env.ADMIN_EMAIL,
                subject: `🚨 새로운 주문 접수 - ${orderData._id}`,
                html: this.generateOrderEmailHTML(orderData),
            };

            const info = await this.transporter.sendMail(mailOptions);

            return {
                success: true,
                messageId: info.messageId,
            };
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            console.error("이메일 발송 실패:", errorMessage);

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    private generateOrderEmailHTML(orderData: OrderData): string {
        const fullAddress = `${orderData.address} ${orderData.detailAddress} (${orderData.postcode})`;

        // 안전한 날짜 처리
        const orderDateTime = orderData.createdAt
            ? new Date(orderData.createdAt).toLocaleString("ko-KR")
            : new Date().toLocaleString("ko-KR");

        // 결제방법 한글 변환
        const payMethodMap: Record<OrderData["payMethod"], string> = {
            NAVER_PAY: "네이버페이",
            KAKAO_PAY: "카카오페이",
            CARD: "신용카드",
        };
        const payMethodText = payMethodMap[orderData.payMethod];

        // 배송상태 한글 변환
        const shippingStatusMap: Record<ShippingStatus, string> = {
            pending: "주문 완료",
            ready: "상품 준비 중",
            shipped: "출고",
            confirm: "구매 확정",
            cancel: "구매 취소 (교환/환불)",
        };
        const shippingStatusText = shippingStatusMap[orderData.shippingStatus];

        // 상품 목록 HTML 생성 (price가 없는 경우 처리)
        const itemsHtml = orderData.items
            .map(
                (item: any) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 16px; color: #374151;">
          <div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
          ${item.sku ? `<div style="font-size: 12px; color: #6b7280;">SKU: ${item.sku}</div>` : ""}
          ${item.description ? `<div style="font-size: 13px; color: #6b7280; margin-top: 2px;">${item.description}</div>` : ""}
        </td>
        <td style="padding: 12px 16px; text-align: center; color: #374151; font-weight: 500;">
          ${item.quantity}개
        </td>
        <td style="padding: 12px 16px; text-align: right; color: #374151;">
          ${item.price ? item.price.toLocaleString() + "원" : "-"}
        </td>
        <td style="padding: 12px 16px; text-align: right; font-weight: 600; color: #dc2626;">
          ${item.price ? (item.quantity * item.price).toLocaleString() + "원" : "-"}
        </td>
      </tr>
    `,
            )
            .join("");

        return `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>새로운 주문 알림</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif; 
            background-color: #f8fafc; 
            line-height: 1.6; 
            color: #1f2937;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background-color: #ffffff; 
            border-radius: 16px; 
            overflow: hidden; 
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); 
            color: white; 
            padding: 40px 32px; 
            text-align: center; 
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          }
          .header-content { position: relative; z-index: 1; }
          .urgent-badge {
            display: inline-block;
            background-color: #fbbf24;
            color: #92400e;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          .header h1 { 
            font-size: 32px; 
            font-weight: 800; 
            margin-bottom: 8px; 
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .header p { 
            font-size: 16px; 
            opacity: 0.95; 
            font-weight: 500;
          }
          .content { padding: 40px 32px; }
          .section { 
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
            border-radius: 12px; 
            padding: 24px; 
            margin-bottom: 24px; 
            border-left: 4px solid #3b82f6; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .section-title { 
            font-size: 18px; 
            font-weight: 700; 
            color: #1e40af; 
            margin-bottom: 20px; 
            display: flex; 
            align-items: center; 
            gap: 8px;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 16px; 
          }
          .info-item { 
            display: flex; 
            align-items: flex-start; 
            gap: 12px;
          }
          .info-label { 
            font-weight: 600; 
            color: #6b7280; 
            min-width: 80px; 
            font-size: 14px;
          }
          .info-value { 
            color: #374151; 
            font-weight: 500; 
            flex: 1; 
          }
          .highlight { 
            color: #dc2626; 
            font-weight: 700; 
          }
          .table-container { 
            overflow-x: auto; 
            margin-bottom: 24px; 
            border-radius: 12px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          }
          .order-table { 
            width: 100%; 
            border-collapse: collapse; 
            background-color: #ffffff; 
          }
          .order-table th { 
            background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); 
            color: white; 
            padding: 16px; 
            text-align: left; 
            font-weight: 700; 
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .order-table th:first-child { border-radius: 12px 0 0 0; }
          .order-table th:last-child { border-radius: 0 12px 0 0; text-align: right; }
          .order-table th:nth-child(2) { text-align: center; }
          .order-table th:nth-child(3) { text-align: right; }
          .order-table tbody tr:hover { background-color: #f8fafc; }
          .order-table tbody tr:last-child td:first-child { border-radius: 0 0 0 12px; }
          .order-table tbody tr:last-child td:last-child { border-radius: 0 0 12px 0; }
          .total-section { 
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
            border-radius: 12px; 
            padding: 24px; 
            text-align: right; 
            margin-bottom: 32px; 
            border: 2px solid #f59e0b;
          }
          .total-label { 
            font-size: 16px; 
            color: #92400e; 
            font-weight: 600; 
            margin-bottom: 8px; 
          }
          .total-amount { 
            font-size: 32px; 
            font-weight: 800; 
            color: #dc2626; 
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .action-section { 
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
            border-radius: 12px; 
            padding: 32px; 
            text-align: center; 
            border: 2px solid #3b82f6;
          }
          .action-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 700; 
            font-size: 16px;
            margin-top: 16px; 
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .action-button:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
          }
          .footer { 
            background-color: #1f2937; 
            color: #9ca3af; 
            padding: 24px 32px; 
            text-align: center; 
            font-size: 14px; 
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-pending { background-color: #fef3c7; color: #92400e; }
          .status-confirm { background-color: #d1fae5; color: #065f46; }
          .status-ready { background-color: #dbeafe; color: #1e40af; }
          .status-shipped { background-color: #e0e7ff; color: #3730a3; }
          .status-delivered { background-color: #dcfce7; color: #166534; }
          .status-cancel { background-color: #fee2e2; color: #991b1b; }
          
          @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 12px; }
            .header { padding: 24px 20px; }
            .content { padding: 24px 20px; }
            .section { padding: 16px; }
            .info-grid { grid-template-columns: 1fr; }
            .header h1 { font-size: 24px; }
            .total-amount { font-size: 24px; }
            .action-section { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-content">
              <span class="urgent-badge">긴급 처리 필요</span>
              <h1>🚨 새로운 주문 접수</h1>
              <p>즉시 확인이 필요한 주문이 들어왔습니다</p>
            </div>
          </div>

          <div class="content">
            <!-- 주문 기본 정보 -->
            <div class="section">
              <div class="section-title">📋 주문 정보</div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">주문 ID:</span>
                  <span class="info-value highlight">${orderData._id || "N/A"}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">주문일시:</span>
                  <span class="info-value">${orderDateTime}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">결제방법:</span>
                  <span class="info-value">${payMethodText}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">배송상태:</span>
                  <span class="info-value">
                    <span class="status-badge status-${orderData.shippingStatus}">${shippingStatusText}</span>
                  </span>
                </div>
                ${
                    orderData.paymentId
                        ? `
                <div class="info-item">
                  <span class="info-label">결제 ID:</span>
                  <span class="info-value">${orderData.paymentId}</span>
                </div>
                `
                        : ""
                }
                ${
                    orderData.trackingNumber
                        ? `
                <div class="info-item">
                  <span class="info-label">송장번호:</span>
                  <span class="info-value">${orderData.trackingNumber}</span>
                </div>
                `
                        : ""
                }
              </div>
            </div>

            <!-- 고객 정보 -->
            <div class="section">
              <div class="section-title">👤 고객 정보</div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">고객 ID:</span>
                  <span class="info-value">${orderData.userId}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">이름:</span>
                  <span class="info-value highlight">${orderData.userNm}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">연락처:</span>
                  <span class="info-value">
                    <a href="tel:${orderData.phoneNumber}" style="color: #2563eb; text-decoration: none;">
                      ${orderData.phoneNumber}
                    </a>
                  </span>
                </div>
              </div>
            </div>

            <!-- 배송 정보 -->
            <div class="section">
              <div class="section-title">🚚 배송 정보</div>
              <div class="info-item">
                <span class="info-label">배송지:</span>
                <span class="info-value">${fullAddress}</span>
              </div>
              ${
                  orderData.deliveryMemo
                      ? `
              <div class="info-item" style="margin-top: 12px;">
                <span class="info-label">배송메모:</span>
                <span class="info-value" style="font-style: italic; color: #6b7280; background-color: #f9fafb; padding: 8px 12px; border-radius: 6px; margin-left: 0;">
                  "${orderData.deliveryMemo}"
                </span>
              </div>
              `
                      : ""
              }
            </div>

            <!-- 주문 상품 -->
            <div class="section">
              <div class="section-title">🛍️ 주문 상품 (총 ${orderData.items.length}개)</div>
              <div class="table-container">
                <table class="order-table">
                  <thead>
                    <tr>
                      <th>상품 정보</th>
                      <th>수량</th>
                      <th>단가</th>
                      <th>소계</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 총 주문금액 -->
            <div class="total-section">
              <div class="total-label">총 주문금액</div>
              <div class="total-amount">${orderData.totalPrice.toLocaleString()}원</div>
            </div>

            <!-- 처리 안내 -->
            <div class="action-section">
              <div class="section-title" style="justify-content: center; color: #1e40af;">⚡ 처리 안내</div>
              <p style="margin: 12px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                새로운 주문이 접수되었습니다.<br>
                <strong style="color: #dc2626;">관리자 페이지에서 즉시 확인하고 처리해주세요.</strong>
              </p>
              <a href="https://twcommunity-server.store/admin/list/orders" 
                 class="action-button">📋 주문 상세보기</a>
            </div>
          </div>

          <div class="footer">
            <p><strong>${process.env.STORE_NAME || "온라인 스토어"}</strong> | 자동 발송 알림</p>
            <p style="margin-top: 8px; font-size: 12px;">
              문의사항: ${process.env.ADMIN_EMAIL || "admin@store.com"}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    }

    async testConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            return true;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            console.error("SMTP 연결 테스트 실패:", errorMessage);
            return false;
        }
    }
}
