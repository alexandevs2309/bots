import { Injectable } from '@nestjs/common';
import { MessageResponseType } from 'src/domain/enums/message-response-type.enum';
import { RequestGroupParticipantsUpdate } from 'src/domain/types/request-group-participants-update.type';
import { ResponseMessage } from 'src/domain/types/response-message.type';
import * as random from 'random-number';

@Injectable()
export class GroupParticipantsCommandService {
  private welcomeMessages: string[] = [
    "¡Bienvenido a nuestra comunidad!",
    "Gracias por unirte a nuestro grupo.",
    "Esperamos que tengas una experiencia increíble aquí.",
    // Agrega más mensajes de bienvenida aquí
  ];

  async handle(payload: RequestGroupParticipantsUpdate): Promise<any> {
    if (payload.action === 'add') {
      return this.welcomeMessage(payload);
    }
    return undefined;
  }

  private async welcomeMessage(
    payload: RequestGroupParticipantsUpdate,
  ): Promise<ResponseMessage[]> {
    const { conversationId, participants } = payload;
    const people = participants?.map((id) => {
      return { number: '@' + id?.split('@')[0], id };
    });
    return people.map((item) => {
      const max = this.welcomeMessages.length - 1;
      const index = random({ max, min: 0, integer: true });

      const header = this.welcomeMessages[index].replace('{NAME}', item?.number || '');
      const rule = `Manda tu nombre, edad, país y una foto de ti`;
      const footer = `Cumple o te sacamos 🙂`;

      const text = `${header}\n\n${rule}\n\n${footer}`;
      const type = MessageResponseType.text;

      return { type, text, conversationId, mentions: [item?.id] };
    });
  }
}
