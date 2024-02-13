import { EntityRepository, Repository } from 'typeorm';
import { Room } from './entities/room.entity';

@EntityRepository(Room)
export class RoomRepository extends Repository<Room> {
  // ここにカスタムのデータベース操作メソッドを追加することができます
}
