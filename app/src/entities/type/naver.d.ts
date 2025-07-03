// src/types/naver.d.ts
declare global {
  interface Window {
    Naver: {
      Pay: {
        create: (config: {
          mode: "development" | "production";
          clientId: string;
          chainId: string;
          payType?: string;
          openType?: string;
          onAuthorize?: (result: any) => void;
        }) => {
          open: (params: {
            merchantPayKey: string;
            productName: string;
            totalPayAmount: number;
            taxScopeAmount: number;
            taxExScopeAmount: number;
            productCount: number;
            returnUrl: string;
            merchantUserKey: string;
            productItems: Array<{
              categoryType: string;
              categoryId: string;
              uid: string;
              name: string;
              count: number;
            }>;
          }) => void;
          close: () => void;
          getVersion: () => string;
        };
      };
    };
  }
}

export {};