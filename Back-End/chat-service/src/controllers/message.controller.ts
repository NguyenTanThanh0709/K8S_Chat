import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';

import { MessageModel } from '../model/message.model';

export class MessageController {
  /**
   * Gửi tin nhắn
   */
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const messageData = req.body;
      const savedMessage = await MessageService.sendMessage(messageData);
      res.status(201).json(savedMessage);
    } catch (error: any) {
      res.status(500).json({
        message: 'Failed to send message',
        error: error.message || error,
      });
    }
  }

  static async getMessages(req: Request, res: Response): Promise<void> {
    const { sender, receiver, is_group } = req.query;
    const limit = parseInt(req.query.limit as string) || 5;  // Default to 20 messages
    const lastMessageTimestamp = req.query.lastMessageTimestamp as string;
    if (!sender || !receiver) {
      res.status(400).json({ message: 'Sender and receiver are required' });
      return;
    }

    try {
      const messages = await MessageService.getMessages(
        sender as string,
        receiver as string,
        is_group === 'true', // Convert to boolean
        limit,
        lastMessageTimestamp
      );

      res.status(200).json(messages);
    } catch (error: any) {
      console.error("Error in getMessages controller:", error);
      res.status(500).json({
        success: false,
        message: `Error retrieving messages: ${error.message || error}`,
      });
    }
  }

  // Thu hồi tin nhắn
  static async recallMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId, userPhone } = req.body;
      const recalled = await MessageService.recallMessage(messageId, userPhone);
      res.json({ message: 'Thu hồi thành công' });
    } catch (error: any) {
      res.status(400).json({ message: error.message || error });
    }
  };

  // message.controller.ts
static async deleteMessageForMe(req: Request, res: Response): Promise<void> {
  try {
    const { messageId, userPhone } = req.body;
    const deletedMessage = await MessageService.deleteMessageForMe(messageId, userPhone);
    res.json({ message: 'Đã xoá tin nhắn cho bạn', deletedMessage });
  } catch (error: any) {
    res.status(400).json({ message: error.message || error });
  }
}

  static async deleteAllMessagesForMe(req: Request, res: Response): Promise<void> {
    try {
      const { userPhone, receiver, isGroup } = req.body;

      if (!userPhone || !receiver) {
        res.status(400).json({ message: 'userPhone và receiver là bắt buộc' });
        return;
      }

      const result = await MessageService.deleteAllMessagesForMe(
        userPhone,
        receiver,
        isGroup
      );

      res.json({
        message: 'Đã xoá toàn bộ tin nhắn trong cuộc trò chuyện cho bạn',
        deletedCount: result.deletedCount,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || error });
    }
  }

   // API: GET /api/messages/search
  static async searchMessages(req: Request, res: Response) : Promise<void>{
    try {
      const { userPhone, receiver, isGroup, keyword, limit } = req.query;

      if (!userPhone || !receiver || !keyword) {
         res.status(400).json({ message: 'Missing required parameters' });
      }

      // gọi service
      const messages = await MessageService.searchMessages(
        userPhone as string,
        receiver as string,
        isGroup === 'true', // query param là string, cần convert
        keyword as string,
        limit ? parseInt(limit as string) : 20
      );

       res.status(200).json(messages);
    } catch (error: any) {
      console.error('Search messages failed:', error);
       res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

    static async getMessagesFromDate(req: Request, res: Response) {
    const { userPhone, receiver, isGroup, startDate } = req.body;
    try {
      const messages = await MessageService.getMessagesFromDate(
        userPhone,
        receiver,
        isGroup,
        new Date(startDate),
      );
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch messages', details: err });
    }
  }


}