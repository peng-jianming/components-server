export const ChatType = Object.freeze({
  TRANFER: 1,
  CHAT: 2,
  IN_HAND: 3,
  CLOSE_APPLICATION: 4,
  AGREE_CLOSE: 5,
  REFUSE_CLOSE: 6,
  CLOSED: 7,
  DELETED: 8
});

export default [
  { id: 1, name: 'TRANFER', value: '转单' },
  { id: 2, name: 'CHAT', value: '聊天' },
  { id: 3, name: 'IN_HAND', value: '处理中' },
  { id: 4, name: 'CLOSE_APPLICATION', value: '申请结单' },
  { id: 5, name: 'AGREE_CLOSE', value: '同意结单' },
  { id: 6, name: 'REFUSE_CLOSE', value: '拒绝结单' },
  { id: 7, name: 'CLOSED', value: '已结单' },
  { id: 8, name: 'DELETED', value: '已删除' }
];
