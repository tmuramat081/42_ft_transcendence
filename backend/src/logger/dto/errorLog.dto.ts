export class ErrorLog {
  /** ログID */
  logId?: string;
  /** タイムスタンプ */
  readonly occurrenceTime: string;
  /** ステータスコード */
  readonly statusCode: number;
  /** リクエストURL */
  readonly requestUrl: string;
  /** 関数名 */
  readonly functionName: string;
  /** エラーメッセージ */
  readonly message: string;
  /** スタック */
  readonly stack?: string;

  constructor(params: Partial<ErrorLog>) {
    this.occurrenceTime = new Date().toISOString();
    this.statusCode = params.statusCode ?? 500;
    this.requestUrl = params.requestUrl ?? 'NONE';
    this.functionName = params.functionName ?? 'NONE';
    this.message = params.message ?? 'NONE';
    this.stack = params.stack;
  }
}
