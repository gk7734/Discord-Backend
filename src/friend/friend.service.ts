import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendService {
  constructor(private readonly prisma: PrismaService) {}

  async addFriend(myId: string, username: string) {
    const friend = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!friend) {
      throw new NotFoundException('친구를 찾을 수 없습니다.');
    }

    return this.prisma.friend.create({
      data: {
        user: { connect: { id: myId } },
        friend: { connect: { id: friend.id } },
      },
    });
  }

  async friendPending(id: number, myId: string, accept: boolean) {
    if (accept) {
      await this.prisma.friend
        .findFirst({
          where: { id, friendId: myId, status: 'Pending' },
        })
        .then((res) => {
          if (!res) {
            throw new NotFoundException('요청을 찾을 수 없습니다.');
          }
          return this.prisma.friend.update({
            where: { id },
            data: { status: 'Accepted' },
          });
        });
    } else {
      return this.prisma.friend.delete({ where: { id } });
    }
  }
}
