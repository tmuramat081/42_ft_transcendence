
export class GamesService {
  constructor(private gameRepository: GameRepository) {}

  /**
   * 試合結果 登録
   */
  async createMatchResult(game: Game): Promise<Game> {
    
  }

  /**
   * 試合結果 詳細取得
   */
  async findOneMatchResult(gameId: number): Promise<Game> {

  }

  /**
   * 試合結果 一覧取得
   */
  async listMatchResult
}