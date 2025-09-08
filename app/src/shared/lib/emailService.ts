import { EmailResult, OrderData, ShippingStatus } from "@/src/components/order/interface";
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

  public async sendOrderNotification(orderData: OrderData): Promise<EmailResult> {
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
        cancel: "주문 취소 (교환/환불)",
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
                  background-color: #f9fafb;
                  color: #111827;
                  line-height: 1.6;
                }
                .container {
                  max-width: 600px;
                  margin: 32px auto;
                  background: #fff;
                  border: 1px solid #e5e7eb;
                  border-radius: 4px;
                }
                .header {
                  background-color: #1f2937;
                  color: #fff;
                  padding: 24px 20px;
                  text-align: center;
                }
                .urgent-badge {
                  display: inline-block;
                  background-color: #facc15;
                  color: #78350f;
                  padding: 4px 12px;
                  font-size: 12px;
                  font-weight: 600;
                  text-transform: uppercase;
                  margin-bottom: 12px;
                }
                .header h1 {
                  font-size: 20px;
                  font-weight: 700;
                  margin-bottom: 6px;
                }
                .header p {
                  font-size: 14px;
                }
                .content {
                  padding: 24px 20px;
                }
                .section {
                  border: 1px solid #e5e7eb;
                  padding: 16px;
                  margin-bottom: 24px;
                  border-radius: 4px;
                }
                .section-title {
                  font-size: 16px;
                  font-weight: 700;
                  margin-bottom: 16px;
                  color: #111827;
                }
                .info-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 12px;
                }
                .info-item {
                  display: flex;
                  align-items: flex-start;
                  gap: 8px;
                }
                .info-label {
                  font-weight: 600;
                  color: #6b7280;
                  font-size: 13px;
                  min-width: 80px;
                }
                .info-value {
                  font-size: 14px;
                  font-weight: 500;
                  color: #111827;
                }
                .highlight {
                  font-weight: 700;
                  color: #dc2626;
                }
                .order-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 12px;
                }
                .order-table th, .order-table td {
                  padding: 12px;
                  border: 1px solid #e5e7eb;
                  font-size: 13px;
                }
                .order-table th {
                  background-color: #f3f4f6;
                  font-weight: 600;
                  text-align: left;
                }
                .order-table td:nth-child(2),
                .order-table th:nth-child(2) {
                  text-align: center;
                }
                .order-table td:nth-child(3),
                .order-table td:nth-child(4),
                .order-table th:nth-child(3),
                .order-table th:nth-child(4) {
                  text-align: right;
                }
                .total-section {
                  text-align: right;
                  padding: 16px;
                  background-color: #fefce8;
                  border: 1px solid #fde68a;
                  border-radius: 4px;
                }
                .total-label {
                  font-size: 14px;
                  font-weight: 600;
                  color: #78350f;
                  margin-bottom: 4px;
                }
                .total-amount {
                  font-size: 20px;
                  font-weight: 700;
                  color: #dc2626;
                }
                .action-section {
                  padding: 20px;
                  text-align: center;
                  border: 1px solid #e5e7eb;
                  background-color: #f9fafb;
                  border-radius: 4px;
                }
                .action-section p {
                  font-size: 14px;
                  color: #374151;
                  margin: 12px 0;
                }
                .action-button {
                  display: inline-block;
                  background-color: #1f2937;
                  color: #fff;
                  padding: 10px 20px;
                  font-weight: 600;
                  font-size: 14px;
                  text-decoration: none;
                  border-radius: 4px;
                }
                .footer {
                  background-color: #f3f4f6;
                  color: #6b7280;
                  font-size: 12px;
                  text-align: center;
                  padding: 16px;
                  border-top: 1px solid #e5e7eb;
                }
                .status-badge {
                  display: inline-block;
                  padding: 2px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  font-weight: 600;
                }
                .status-pending { background-color: #fef3c7; color: #92400e; }
                .status-confirm { background-color: #d1fae5; color: #065f46; }
                .status-ready { background-color: #dbeafe; color: #1e40af; }
                .status-shipped { background-color: #e0e7ff; color: #3730a3; }
                .status-delivered { background-color: #dcfce7; color: #166534; }
                .status-cancel { background-color: #fee2e2; color: #991b1b; }
                @media (max-width: 600px) {
                  .container { margin: 10px; }
                  .info-grid { grid-template-columns: 1fr; }
                  .total-amount { font-size: 18px; }
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
                    <a href="https://lafarfalla.kr/admin/list/orders" 
                      class="action-button">📋 주문 상세보기</a>
                  </div>
                </div>

                <div class="footer">
                  <p><strong>라파팔라</strong> | 자동 발송 알림</p>
                  <p style="margin-top: 8px; font-size: 12px;">
                    문의사항: cofsl0411@naver.com
                  </p>
                </div>
              </div>
            </body>
          </html>
        `;
  }

  public async sendEmailAuthNotification(
    email: string,
    authNumber: number,
  ): Promise<EmailResult> {
    try {
        const mailOptions = {
            from: `"라파팔라" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `이메일 인증번호`,
            html: this.generateAuthEmailHTML(authNumber),
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

  private generateAuthEmailHTML(authNumber: number): string {
    return `
          <!DOCTYPE html>
            <html lang="ko">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>이메일 인증번호</title>
                <style>
                  body {
                    background-color: #f9fafb;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
                    color: #111827;
                    margin: 0;
                    padding: 0;
                  }
                  .container {
                    max-width: 480px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    padding: 32px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                    text-align: center;
                  }
                  .title {
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 12px;
                    color: #1f2937;
                  }
                  .subtitle {
                    font-size: 14px;
                    color: #6b7280;
                    margin-bottom: 24px;
                  }
                  .code {
                    font-size: 32px;
                    font-weight: 800;
                    letter-spacing: 6px;
                    padding: 16px 24px;
                    background-color: #f3f4f6;
                    color: #2563eb;
                    border-radius: 8px;
                    display: inline-block;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
                  }
                  .footer {
                    font-size: 12px;
                    color: #9ca3af;
                    margin-top: 40px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="title">이메일 인증번호</div>
                  <div class="subtitle">아래의 인증번호를 입력해주세요</div>
                  <div class="code">${authNumber}</div>
                  <div class="footer">
                    © 2025 라파팔라<br />
                    문의: cofsl0411@naver.com
                  </div>
                </div>
              </body>
            </html>
        `;
  }

  // 임시 비밀번호 이메일 전송
  public async sendTempPasswordEmail(toEmail: string, tempPassword: string): Promise<EmailResult> {
      const mailOptions = {
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER, // 발신자 이메일
          to: toEmail,
          subject: "[라파팔라] 임시 비밀번호 발급 안내",
          html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                  <h2 style="color: #000; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">비밀번호 찾기 안내</h2>
                  <p>안녕하세요, 고객님.</p>
                  <p>요청하신 임시 비밀번호가 발급되었습니다.</p>
                  <p style="font-size: 1.2em; font-weight: bold; background-color: #f8f8f8; padding: 15px; border-radius: 5px; text-align: center; border: 1px dashed #ccc;">
                      임시 비밀번호: <span style="color: #d9534f;">${tempPassword}</span>
                  </p>
                  <p>로그인 후, 보안을 위해 즉시 비밀번호를 변경해 주세요. 이 임시 비밀번호는 타인에게 노출되지 않도록 주의 바랍니다.</p>
                  <p>감사합니다.</p>
                  <div style="text-align: center; margin-top: 20px; font-size: 0.8em; color: #777;">
                      <p>본 메일은 발신 전용입니다. 문의는 채널톡을 이용해 주세요.</p>
                  </div>
              </div>
          `,
      };

      try {
          const info = await this.transporter.sendMail(mailOptions);
          // console.log("임시 비밀번호 이메일 전송 성공:", info.messageId);
          return { success: true, messageId: info.messageId };
      } catch (error) {
          console.error("이메일 전송 실패:", error);
          if (error instanceof Error) {
              return { success: false, error: error.message };
          }
          return { success: false, error: "Unknown email sending error" };
      }
  }
}
