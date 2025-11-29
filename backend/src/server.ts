import http from 'http';
import app from './app';
import { SLAService } from './services/sla.service';
import { initSocket } from './config/socket';
import { startNotificationWorker } from './workers/notification.worker';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    SLAService.init();
    startNotificationWorker();
});


