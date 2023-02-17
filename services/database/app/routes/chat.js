const { Router } = require('../services/imports');

const router = new Router({
  prefix: '/chat',
});

const middleware = require('../middleware');
const chat = require('../controllers/chat');

router.post('/get-rooms', chat.getRooms);
router.post('/create-room', chat.createRoom);
router.post('/add-important-message', chat.addImportantMessage);
router.get('/get-important-message', chat.getImportantMessage);
router.get('/search-message', chat.searchMessage);
router.post('/add-message', chat.addMessage);
router.post('/message-history', chat.messageHistory);
router.delete('/delete-message', chat.deleteMessage);
router.delete('/delete-room', chat.deleteRoom);

module.exports = router;
