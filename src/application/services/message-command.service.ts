import { Injectable } from '@nestjs/common';
import { CommandName } from 'src/domain/enums/command-name.enum';
import { MessageResponseType } from 'src/domain/enums/message-response-type.enum';
import { MessageType } from 'src/domain/enums/message-type.enum';
import { RequestMessage } from 'src/domain/types/request-message.type';
import { ResponseMessage } from 'src/domain/types/response-message.type';
import { ChatService } from './chat.service';
import { FirebaseService } from './firebase.service';
import { MediaService } from './media.service';

@Injectable()
export class MessageCommandService {
  constructor(
    private firebaseService: FirebaseService,
    private chatService: ChatService,
    private mediaService: MediaService,
  ) {}

  async handle(payload: RequestMessage): Promise<any> {
    const text = payload?.message?.text || '';

    if (payload?.fromMe) return undefined;

    if (this.testPattern(CommandName.PING, text)) {
      return this.ping(payload);
    }

    if (this.testPattern(CommandName.HELP, text)) {
      return this.help(payload);
    }

    if (this.testPattern(CommandName.STICKER, text)) {
      return this.sticker(payload);
    }

    if (this.testPattern(CommandName.INSULT, text)) {
      return this.insult(payload);
    }

    if (this.testPattern(CommandName.CHAT, text)) {
      return this.chat(payload);
    }

    return undefined;
  }

  private testPattern(pattern: string, text: string): boolean {
    const validator = new RegExp(`${pattern}\\b`, 'gi');
    return validator.test(text);
  }

  private ping(payload: RequestMessage): ResponseMessage {
    const { conversationId } = payload;
    return { conversationId, type: MessageResponseType.text, text: 'pong 🏓' };
  }

  private help(payload: RequestMessage): ResponseMessage {
    const { conversationId } = payload;
    const commands = [
      '*!ping*: _Envia una respuesta del servidor._',
      '*!help*: _Muestra el menu de commandos._',
      '*!sticker*: _Convierte cualquier imagen, gif, video en sticker._',
      '*!chat*: _Puedes conversar con chatgpt, (necesitas pedir acceso)(respuesta lenta)(beta)._',
      '*!insult*: _Envia un instulto a la persona que mencionas._',
    ].join(`\n`);
    const text = `⌘⌘⌘⌘⌘ *MENU* ⌘⌘⌘⌘⌘\n\n${commands}\n\n⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘⌘`;
    return { conversationId, type: MessageResponseType.text, text };
  }

  private async sticker(payload: RequestMessage): Promise<ResponseMessage> {
    const { conversationId, message } = payload;
    if (!payload.message.media) return undefined;
    if (payload.message.type === MessageType.image) {
      const media = await this.mediaService.image(message.media);
      return { conversationId, type: MessageResponseType.sticker, media };
    }
    if (payload.message.type === MessageType.video) {
      const media = await this.mediaService.video(message.media);
      return { conversationId, type: MessageResponseType.sticker, media };
    }
    return undefined;
  }
  private insult(payload: RequestMessage): ResponseMessage {
    const { conversationId, message } = payload;
    const { mentions } = message;
    const people = mentions?.map((item) => '@' + item?.split('@')[0]);
    const insults = [
      'Eres más tonto que un plátano en una tienda de zapatos',
      'Eres más leso que un chivo en un supermercado',
      'Eres más bruto que un pote de pegamento',
      'Eres más menso que un burro con lentes',
      'Eres más baboso que un sapo en un charco',
      'Eres más lento que una tortuga en una carrera de gatos',
      'Eres más corto que una semana laboral en domingo',
      'Eres más pendejo que una puerta sin manija',
      'Eres más bobo que un oso hormiguero en un juego de ajedrez',
      'Eres más tonto que una lavadora sin electricidad',
      'Eres más guevón que un caracol en un rally',
      'Eres más bruto que un saco de cemento',
      'Eres más menso que una silla sin patas',
      'Eres más tonto que una papa en un salón de belleza',
      'Eres más baboso que una gallina en un espejo',
      'Eres más lerdo que un caracol en una carrera de guepardos',
      '      Eres más lento que un caracol con resaca.',
      'Tienes menos luces que un sótano en penumbras.',
      'Tu inteligencia es comparable a la de un cubo de hielo.',
      'Eres más aburrido que ver secar la pintura.',
      'Tienes menos gracia que un patinador sobre hielo.',
      'Eres como una película de terror sin sustos ni emoción.',
      'Tu creatividad es similar a la de una piedra.',
      'Tienes el encanto de un calcetín mojado.',
      'Eres más despistado que un pingüino en el desierto.',
      'Tu sentido del humor es comparable al de un extintor.',
      'Eres más lento que una tortuga con muletas.',
      'Tu coeficiente intelectual es tan bajo que tropieza con tus propios pensamientos.',
      'Tienes menos gracia que una cebra con patines.',
      'Eres como una ensalada sin aderezo, ¡totalmente insípido!',
      'Tu capacidad para entender chistes es comparable a la de una piedra.',
      'Eres más predecible que el pronóstico del tiempo en el desierto.',
      'Tu cerebro parece una red de pesca... llena de agujeros.',
      'Tienes la habilidad de hacer que el tiempo pase más lento con tu aburrimiento.',
      'Eres como una película sin subtítulos, ¡nadie entiende lo que dices!',
      'Tienes menos chispa que un fósforo mojado.',
      'Tienes menos gracia que una tostada sin mantequilla.',
      'Eres más despistado que una cabra en una tienda de porcelanas.',
      'Tu sentido del humor es tan seco que podrías hacer un desierto parecer un océano.',
      'Eres como una película de terror sin monstruos, ¡totalmente aburrido!',
      'Tienes la habilidad de convertir un chiste en una tragedia griega.',
      'Eres más difícil de entender que un manual de instrucciones mal traducido.',
      'Tienes menos encanto que una patata sin sal.',
      'Eres tan divertido como una puerta cerrada.',
      'Tu ingenio es tan agudo como una pelota de algodón.',
      'Eres como un chiste malo, nadie quiere escucharte',
    ];
    const index = Math.floor(Math.random() * insults.length);
    const text = `${insults[index]} ${people.join(' ')}`;
    return { conversationId, type: MessageResponseType.text, text, mentions };
  }

  private async chat(payload: RequestMessage): Promise<ResponseMessage> {
    const { conversationId, message } = payload;
    const text = message?.text || '';
    const whitelist: string[] = await this.firebaseService.getWhiteList();
    const [conversationNumber] = payload?.conversationId?.split('@');
    const [userNumber] = payload?.userId?.split('@');
    const prompt = text?.replace(CommandName.CHAT, '').trim();
    const isConversationNumber = whitelist?.includes(conversationNumber);
    const isUserNumber = whitelist?.includes(userNumber);
    if (isConversationNumber || isUserNumber) {
      const response = await this.chatService.send(prompt);
      return { conversationId, type: MessageResponseType.text, text: response };
    }
    return undefined;
  }
}
