import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

// 環境変数の読み込み
const API_KEY = process.env.MICROCMS_API_KEY;
const BASE_URL =
  process.env.MICROCMS_BASE_URL?.replace(/\/+$/, "") ||
  "https://your-service.microcms.io";

if (!API_KEY) {
  console.error("MICROCMS_API_KEY is not set in .env.local file");
  process.exit(1);
}

console.error(`MicroCMS Base URL: ${BASE_URL}`);
console.error(`API Key: ${API_KEY.substring(0, 5)}...`);

// microCMSのAPIクライアントクラス
class MicroCMSClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * コンテンツ一覧を取得する
   */
  async getList(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const url = `${this.baseUrl}/api/v1/${endpoint}${
      queryString ? `?${queryString}` : ""
    }`;

    console.error(`GET Request URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        "X-MICROCMS-API-KEY": this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`);
      console.error(`Error Response: ${errorText}`);
      throw new Error(
        `Failed to fetch from microCMS: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * 特定のコンテンツを取得する
   */
  async getContent(
    endpoint: string,
    contentId: string,
    params: Record<string, string> = {}
  ): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const url = `${this.baseUrl}/api/v1/${endpoint}/${contentId}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      headers: {
        "X-MICROCMS-API-KEY": this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch content from microCMS: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * コンテンツを作成する (POST)
   */
  async createContent(
    endpoint: string,
    data: Record<string, any>
  ): Promise<any> {
    const url = `${this.baseUrl}/api/v1/${endpoint}`;

    console.error(`POST Request URL: ${url}`);
    console.error(`POST Data:`, JSON.stringify(data, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-MICROCMS-API-KEY": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`POST Error: ${response.status} ${response.statusText}`);
      console.error(`Error Response: ${errorText}`);
      throw new Error(
        `Failed to create content: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  /**
   * コンテンツを作成/更新する (PUT) - IDを指定
   */
  async putContent(
    endpoint: string,
    contentId: string,
    data: Record<string, any>
  ): Promise<any> {
    const url = `${this.baseUrl}/api/v1/${endpoint}/${contentId}`;

    console.error(`PUT Request URL: ${url}`);
    console.error(`PUT Data:`, JSON.stringify(data, null, 2));

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "X-MICROCMS-API-KEY": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`PUT Error: ${response.status} ${response.statusText}`);
      console.error(`Error Response: ${errorText}`);
      throw new Error(
        `Failed to put content: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  /**
   * コンテンツを部分更新する (PATCH)
   */
  async patchContent(
    endpoint: string,
    contentId: string,
    data: Record<string, any>
  ): Promise<any> {
    const url = `${this.baseUrl}/api/v1/${endpoint}/${contentId}`;

    // リッチエディタフィールドのHTMLを確認して警告を表示
    const processedData = { ...data };
    for (const key in processedData) {
      if (typeof processedData[key] === 'string' && processedData[key].includes('<')) {
        console.error(`Note: Field '${key}' contains HTML-like content. Ensure it's properly formatted for microCMS.`);
      }
    }

    console.error(`PATCH Request URL: ${url}`);
    console.error(`PATCH Data:`, JSON.stringify(processedData, null, 2));
    console.error(`PATCH Headers:`, {
      "X-MICROCMS-API-KEY": `${this.apiKey.substring(0, 5)}...`,
      "Content-Type": "application/json",
    });

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "X-MICROCMS-API-KEY": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(processedData),
    });

    console.error(`PATCH Response Status: ${response.status} ${response.statusText}`);
    console.error(`PATCH Response Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`PATCH Error: ${response.status} ${response.statusText}`);
      console.error(`Error Response: ${errorText}`);
      
      // Parse error details if available
      try {
        const errorJson = JSON.parse(errorText);
        console.error(`Error Details:`, JSON.stringify(errorJson, null, 2));
      } catch (e) {
        // Error response is not JSON
      }
      
      throw new Error(
        `Failed to patch content: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const result = await response.json();
    console.error(`PATCH Success Response:`, JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * コンテンツを削除する (DELETE)
   */
  async deleteContent(endpoint: string, contentId: string): Promise<any> {
    const url = `${this.baseUrl}/api/v1/${endpoint}/${contentId}`;

    console.error(`DELETE Request URL: ${url}`);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "X-MICROCMS-API-KEY": this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DELETE Error: ${response.status} ${response.statusText}`);
      console.error(`Error Response: ${errorText}`);
      throw new Error(
        `Failed to delete content: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    // DELETEは通常レスポンスボディがない
    return { success: true };
  }
}

// microCMSクライアントのインスタンス作成
const microCMS = new MicroCMSClient(API_KEY, BASE_URL);

// MCPサーバーの作成
const server = new McpServer({
  name: "microCMS-MCP-Server",
  version: "1.0.0",
});

// === 既存の読み取り機能 ===

// コンテンツ一覧取得のツール
server.tool(
  "get_contents",
  {
    endpoint: z
      .string()
      .describe("取得したいmicroCMSのAPIエンドポイント (例: 'blog')"),
    limit: z
      .number()
      .optional()
      .describe("取得する件数 (デフォルト: 10, 最大: 100)"),
    offset: z.number().optional().describe("取得開始位置のオフセット"),
    orders: z
      .string()
      .optional()
      .describe("並び替え (例: 'publishedAt' or '-publishedAt')"),
    q: z.string().optional().describe("全文検索クエリ"),
    filters: z
      .string()
      .optional()
      .describe("フィルタ条件 (例: 'title[contains]テスト')"),
    fields: z
      .string()
      .optional()
      .describe("取得フィールド (例: 'id,title,publishedAt')"),
    depth: z.number().optional().describe("参照の深さ (1-3)"),
  },
  async (params: any) => {
    try {
      const queryParams: Record<string, string> = {};
      if (params.limit !== undefined)
        queryParams.limit = params.limit.toString();
      if (params.offset !== undefined)
        queryParams.offset = params.offset.toString();
      if (params.orders) queryParams.orders = params.orders;
      if (params.q) queryParams.q = params.q;
      if (params.filters) queryParams.filters = params.filters;
      if (params.fields) queryParams.fields = params.fields;
      if (params.depth !== undefined)
        queryParams.depth = params.depth.toString();

      const data = await microCMS.getList(params.endpoint, queryParams);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `エラー: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// 特定コンテンツ取得のツール
server.tool(
  "get_content",
  {
    endpoint: z
      .string()
      .describe("取得したいmicroCMSのAPIエンドポイント (例: 'blog')"),
    contentId: z.string().describe("取得したいコンテンツのID"),
    fields: z
      .string()
      .optional()
      .describe("取得フィールド (例: 'id,title,publishedAt')"),
    depth: z.number().optional().describe("参照の深さ (1-3)"),
    draftKey: z
      .string()
      .optional()
      .describe("下書きコンテンツを取得するためのキー"),
  },
  async (params: any) => {
    try {
      const queryParams: Record<string, string> = {};
      if (params.fields) queryParams.fields = params.fields;
      if (params.depth !== undefined)
        queryParams.depth = params.depth.toString();
      if (params.draftKey) queryParams.draftKey = params.draftKey;

      const data = await microCMS.getContent(
        params.endpoint,
        params.contentId,
        queryParams
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `エラー: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// === 新しいデータ投入機能 ===

// コンテンツ作成ツール (POST - ID自動生成)
server.tool(
  "create_content",
  {
    endpoint: z
      .string()
      .describe("作成先のmicroCMSのAPIエンドポイント (例: 'blog')"),
    data: z.record(z.any()).describe("作成するコンテンツのデータ（JSON形式）"),
    status: z
      .enum(["draft", "publish"])
      .optional()
      .describe("公開ステータス (draft: 下書き, publish: 公開)"),
  },
  async (params: any) => {
    try {
      let requestData = { ...params.data };

      // ステータス管理
      if (params.status === "draft") {
        // 下書きとして作成（公開しない）
        // MicroCMSでは下書きの場合、APIリクエスト時に特別な処理は不要
      }

      const result = await microCMS.createContent(params.endpoint, requestData);
      return {
        content: [
          {
            type: "text",
            text: `✅ コンテンツを作成しました (ID: ${
              result.id
            }):\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ 作成エラー: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// コンテンツ作成/更新ツール (PUT - ID指定)
server.tool(
  "put_content",
  {
    endpoint: z
      .string()
      .describe("作成/更新先のmicroCMSのAPIエンドポイント (例: 'blog')"),
    contentId: z.string().describe("指定するコンテンツID"),
    data: z.record(z.any()).describe("作成/更新するデータ（JSON形式）"),
    status: z
      .enum(["draft", "publish"])
      .optional()
      .describe("公開ステータス (draft: 下書き, publish: 公開)"),
  },
  async (params: any) => {
    try {
      let requestData = { ...params.data };

      const result = await microCMS.putContent(
        params.endpoint,
        params.contentId,
        requestData
      );
      return {
        content: [
          {
            type: "text",
            text: `✅ コンテンツを作成/更新しました (ID: ${
              params.contentId
            }):\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ 作成/更新エラー: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// コンテンツ部分更新ツール (PATCH)
server.tool(
  "patch_content",
  {
    endpoint: z
      .string()
      .describe("更新先のmicroCMSのAPIエンドポイント (例: 'blog')"),
    contentId: z.string().describe("更新するコンテンツのID"),
    data: z.record(z.any()).describe("部分更新するデータ（JSON形式）。リッチエディタフィールドには生のHTMLを指定可能"),
  },
  async (params: any) => {
    try {
      // Validate that data is an object
      if (!params.data || typeof params.data !== 'object') {
        throw new Error('データはオブジェクト形式で指定してください');
      }
      
      // Log the parameters for debugging
      console.error(`PATCH Tool Parameters:`, {
        endpoint: params.endpoint,
        contentId: params.contentId,
        data: params.data
      });
      
      // HTMLフィールドの注意喚起
      for (const key in params.data) {
        if (typeof params.data[key] === 'string' && params.data[key].includes('<')) {
          console.error(`⚠️ Field '${key}' contains HTML content. microCMS rich editor fields accept HTML strings.`);
          console.error(`  Supported tags: h1-h5, p, strong, em, u, s, code, ul, ol, li, table, a, img`);
          console.error(`  Ensure proper formatting without line breaks in the request.`);
        }
      }
      
      const result = await microCMS.patchContent(
        params.endpoint,
        params.contentId,
        params.data
      );
      return {
        content: [
          {
            type: "text",
            text: `✅ コンテンツを部分更新しました (ID: ${
              params.contentId
            }):\n${JSON.stringify(result, null, 2)}\n\n⚠️ 注意: リッチエディタフィールドのHTMLが正しく更新されない場合は、HTMLタグが適切にフォーマットされているか確認してください。`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ 部分更新エラー: ${
              error instanceof Error ? error.message : String(error)
            }\n\n💡 ヒント: リッチエディタフィールドを更新する場合は、生のHTMLを使用してください。例: "<p>テキスト</p>"`,
          },
        ],
        isError: true,
      };
    }
  }
);

// コンテンツ更新ツール (非推奨 - PUT を使用)
server.tool(
  "update_content",
  {
    endpoint: z
      .string()
      .describe("更新先のmicroCMSのAPIエンドポイント (例: 'blog')"),
    contentId: z.string().describe("更新するコンテンツのID"),
    data: z.record(z.any()).describe("更新するデータ（JSON形式）"),
  },
  async (params: any) => {
    try {
      const result = await microCMS.putContent(
        params.endpoint,
        params.contentId,
        params.data
      );
      return {
        content: [
          {
            type: "text",
            text: `✅ コンテンツを更新しました (ID: ${
              params.contentId
            }):\n${JSON.stringify(
              result,
              null,
              2
            )}\n\n⚠️ このツールは非推奨です。put_content または patch_content を使用してください。`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ 更新エラー: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// コンテンツ削除ツール
server.tool(
  "delete_content",
  {
    endpoint: z
      .string()
      .describe("削除先のmicroCMSのAPIエンドポイント (例: 'blog')"),
    contentId: z.string().describe("削除するコンテンツのID"),
  },
  async (params: any) => {
    try {
      await microCMS.deleteContent(params.endpoint, params.contentId);
      return {
        content: [
          {
            type: "text",
            text: `✅ コンテンツ (ID: ${params.contentId}) を削除しました`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ 削除エラー: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// バッチ作成ツール（複数コンテンツを一括作成）
server.tool(
  "batch_create_contents",
  {
    endpoint: z
      .string()
      .describe("作成先のmicroCMSのAPIエンドポイント (例: 'authors')"),
    contents: z.array(z.record(z.any())).describe("作成するコンテンツの配列"),
    method: z
      .enum(["post", "put"])
      .default("post")
      .describe("作成方法 (post: ID自動生成, put: ID指定)"),
  },
  async (params: any) => {
    try {
      const results = [];
      for (let i = 0; i < params.contents.length; i++) {
        const content = params.contents[i];
        try {
          let result;
          if (params.method === "put" && content.id) {
            // PUTの場合はIDを指定
            const { id, ...data } = content;
            result = await microCMS.putContent(params.endpoint, id, data);
            result.id = id; // IDを結果に含める
          } else {
            // POSTの場合はID自動生成
            result = await microCMS.createContent(params.endpoint, content);
          }
          results.push({ index: i, success: true, data: result });
        } catch (error) {
          results.push({
            index: i,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            data: content,
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      return {
        content: [
          {
            type: "text",
            text: `📊 バッチ作成結果 (${params.method.toUpperCase()}):\n✅ 成功: ${successCount}件\n❌ 失敗: ${failCount}件\n\n詳細:\n${JSON.stringify(
              results,
              null,
              2
            )}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ バッチ作成エラー: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// === 既存の検索機能 ===

server.tool(
  "search_contents",
  {
    endpoint: z
      .string()
      .describe("検索対象のmicroCMSのAPIエンドポイント (例: 'blog')"),
    q: z.string().describe("検索キーワード"),
    limit: z
      .number()
      .optional()
      .describe("取得する件数 (デフォルト: 10, 最大: 100)"),
    offset: z.number().optional().describe("取得開始位置のオフセット"),
    fields: z
      .string()
      .optional()
      .describe("取得フィールド (例: 'id,title,publishedAt')"),
    depth: z.number().optional().describe("参照の深さ (1-3)"),
  },
  async (params: any) => {
    try {
      const queryParams: Record<string, string> = { q: params.q };
      if (params.limit !== undefined)
        queryParams.limit = params.limit.toString();
      if (params.offset !== undefined)
        queryParams.offset = params.offset.toString();
      if (params.fields) queryParams.fields = params.fields;
      if (params.depth !== undefined)
        queryParams.depth = params.depth.toString();

      const data = await microCMS.getList(params.endpoint, queryParams);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `エラー: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "filter_contents",
  {
    endpoint: z
      .string()
      .describe("検索対象のmicroCMSのAPIエンドポイント (例: 'blog')"),
    filters: z
      .string()
      .describe(
        "フィルター条件 (例: 'category[equals]news[and]createdAt[greater_than]2023-01-01')"
      ),
    limit: z
      .number()
      .optional()
      .describe("取得する件数 (デフォルト: 10, 最大: 100)"),
    offset: z.number().optional().describe("取得開始位置のオフセット"),
    fields: z
      .string()
      .optional()
      .describe("取得フィールド (例: 'id,title,publishedAt')"),
    depth: z.number().optional().describe("参照の深さ (1-3)"),
  },
  async (params: any) => {
    try {
      const queryParams: Record<string, string> = { filters: params.filters };
      if (params.limit !== undefined)
        queryParams.limit = params.limit.toString();
      if (params.offset !== undefined)
        queryParams.offset = params.offset.toString();
      if (params.fields) queryParams.fields = params.fields;
      if (params.depth !== undefined)
        queryParams.depth = params.depth.toString();

      const data = await microCMS.getList(params.endpoint, queryParams);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `エラー: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// === リソース定義 ===

server.resource(
  "content",
  new ResourceTemplate("microcms://{endpoint}/{contentId}", {
    list: undefined,
  }),
  async (uri, variables) => {
    const endpoint = variables.endpoint as string;
    const contentId = variables.contentId as string;
    try {
      const data = await microCMS.getContent(endpoint, contentId);
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `エラー: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.resource(
  "contents",
  new ResourceTemplate("microcms://{endpoint}", { list: undefined }),
  async (uri, variables) => {
    const endpoint = variables.endpoint as string;
    try {
      const data = await microCMS.getList(endpoint);
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `エラー: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

async function main() {
  console.error("Starting microCMS MCP Server...");
  console.error("Available tools:");
  console.error("📖 READ Operations:");
  console.error("- get_contents: コンテンツ一覧取得");
  console.error("- get_content: 個別コンテンツ取得");
  console.error("- search_contents: 検索");
  console.error("- filter_contents: フィルター検索");
  console.error("✏️ WRITE Operations:");
  console.error("- create_content: コンテンツ作成 (POST - ID自動生成)");
  console.error("- put_content: コンテンツ作成/更新 (PUT - ID指定)");
  console.error("- patch_content: コンテンツ部分更新 (PATCH)");
  console.error("- update_content: [非推奨] コンテンツ更新");
  console.error("- delete_content: コンテンツ削除");
  console.error("🔄 BATCH Operations:");
  console.error("- batch_create_contents: バッチ作成");
  console.error("");
  console.error("📝 API仕様に準拠:");
  console.error("- POST: IDが自動生成されます");
  console.error("- PUT: 指定されたIDでコンテンツを作成/更新します");
  console.error("- PATCH: 既存コンテンツの部分更新を行います");
  console.error("- DELETE: コンテンツを削除します");
  console.error("- リスト形式APIのみサポート (Authors, Tags, Blog)");

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
