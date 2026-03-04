import AppRouter from './routes/AppRouter';

export default function Root() {
    console.log('Root.tsx: rendering with AppRouter...');

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#ff9800', color: 'white', padding: '10px', textAlign: 'center' }}>
                DEBUG: ROOT LOADED. ROUTER TESTING...
            </div>
            <div style={{ flex: 1 }}>
                <AppRouter />
            </div>
        </div>
    );
}
