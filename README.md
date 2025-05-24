# microCMS Full-Stack MCP Server

[Model Context Protocol (MCP)](https://modelcontextprotocol.io) を使用した、microCMS の完全な API 操作を実現する MCP サーバーです。

## 特徴

このMCPサーバーは、microCMS APIの全機能をカバーする包括的な実装を提供します：

- **完全なCRUD操作**: コンテンツの作成、読み取り、更新、削除をサポート
- **バッチ処理**: 複数コンテンツの一括操作
- **高度なクエリ機能**: フィルタリング、検索、フィールド選択、並び替え
- **下書き対応**: 下書きコンテンツの取得・管理
- **エラーハンドリング**: 詳細なエラーログとメッセージ

## インストール

```bash
# リポジトリのクローン
git clone [your-repo-url]
cd microcms-full-stack-mcp-server

# 依存関係のインストール
npm install

# ビルド
npm run build
```

## セットアップ

### 環境変数

以下の環境変数が必要です：

- `MICROCMS_API_KEY`: microCMS の API キー
- `MICROCMS_BASE_URL`: microCMS のサービス URL（例: `https://your-service.microcms.io`）

### Claude Desktop での設定

`claude_desktop_config.json` に以下を追加：

```json
{
  "mcpServers": {
    "microcms-fullstack": {
      "command": "node",
      "args": [
        "/path/to/microcms-full-stack-mcp-server/dist/index.js"
      ],
      "env": {
        "MICROCMS_API_KEY": "your-api-key",
        "MICROCMS_BASE_URL": "https://your-service.microcms.io"
      }
    }
  }
}
```

## 利用可能なツール

### 読み取り操作

#### `get_contents`
コンテンツ一覧を取得します。

**パラメータ**:
- `endpoint`: API エンドポイント（必須）
- `limit`: 取得件数（デフォルト: 10、最大: 100）
- `offset`: オフセット
- `orders`: 並び替え（例: `-publishedAt`）
- `q`: 全文検索クエリ
- `filters`: フィルタ条件
- `fields`: 取得フィールド
- `depth`: 参照の深さ（1-3）

#### `get_content`
特定のコンテンツを取得します。

**パラメータ**:
- `endpoint`: API エンドポイント（必須）
- `contentId`: コンテンツ ID（必須）
- `fields`: 取得フィールド
- `depth`: 参照の深さ（1-3）
- `draftKey`: 下書きキー

#### `search_contents`
キーワード検索を実行します。

**パラメータ**:
- `endpoint`: API エンドポイント（必須）
- `q`: 検索キーワード（必須）
- その他のパラメータは `get_contents` と同様

#### `filter_contents`
詳細なフィルタリングを実行します。

**パラメータ**:
- `endpoint`: API エンドポイント（必須）
- `filters`: フィルタ条件（必須）
- その他のパラメータは `get_contents` と同様

### 書き込み操作

#### `create_content`
新規コンテンツを作成します（ID 自動生成）。

**パラメータ**:
- `endpoint`: API エンドポイント（必須）
- `data`: コンテンツデータ（必須）
- `status`: 公開ステータス（'draft' または 'publish'）

#### `put_content`
指定 ID でコンテンツを作成または更新します。

**パラメータ**:
- `endpoint`: API エンドポイント（必須）
- `contentId`: コンテンツ ID（必須）
- `data`: コンテンツデータ（必須）
- `status`: 公開ステータス

#### `patch_content`
既存コンテンツを部分更新します。

**パラメータ**:
- `endpoint`: API エンドポイント（必須）
- `contentId`: コンテンツ ID（必須）
- `data`: 更新データ（必須）

#### `delete_content`
コンテンツを削除します。

**パラメータ**:
- `endpoint`: API エンドポイント（必須）
- `contentId`: コンテンツ ID（必須）

### バッチ操作

#### `batch_create_contents`
複数コンテンツを一括作成します。

**パラメータ**:
- `endpoint`: API エンドポイント（必須）
- `contents`: コンテンツ配列（必須）
- `method`: 作成方法（'post' または 'put'、デフォルト: 'post'）

### 非推奨

#### `update_content` (非推奨)
`put_content` または `patch_content` を使用してください。

## 使用例

```
# コンテンツ一覧の取得
blog エンドポイントから最新10件の記事を取得して

# 新規コンテンツの作成
blog エンドポイントに新しい記事を作成して。タイトルは「MCPサーバーの使い方」、本文は「MCPサーバーは...」

# コンテンツの更新
blog エンドポイントの ID が abc123 の記事のタイトルを「更新されたタイトル」に変更して

# バッチ作成
authors エンドポイントに3人の著者を一括で登録して
```

## リソース URI

- `microcms://{endpoint}/{contentId}`: 特定コンテンツへのアクセス
- `microcms://{endpoint}`: コンテンツ一覧へのアクセス

## 技術仕様

- **プロトコル**: Model Context Protocol (MCP)
- **通信方式**: stdio
- **対応 API**: microCMS API v1
- **言語**: TypeScript
- **必要な Node.js バージョン**: 16.0.0 以上

## ライセンス

MIT License