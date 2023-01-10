import botRoutes from './bot.router.js';

export default function appRouter(app) {
    // default route
    app.get('/', (req, res) => {
        res.send('Welcome to Mantium Whatsapp Bot!');
    });
    // import other routes
    botRoutes(app);
}