export function BackgroundPattern() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            {/* Background dots pattern */}
            <div
                className="absolute inset-0 opacity-[0.08] dark:opacity-[0.04]"
                style={{
                    backgroundImage: `radial-gradient(circle at center, #6b7280 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Plus pattern */}
            <div
                className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #9ca3af 1px, transparent 1px),
                        linear-gradient(to bottom, #9ca3af 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                    backgroundPosition: '30px 30px'
                }}
            />

            {/* Animated shine waves */}
            <div className="absolute inset-0">
                <div
                    className="absolute w-[600px] h-[600px] -top-48 -left-48 rounded-full blur-3xl opacity-15"
                    style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.08))',
                        animation: 'shine1 12s ease-in-out infinite'
                    }}
                />
                <div
                    className="absolute w-[700px] h-[700px] top-1/2 -translate-y-1/2 -right-1/2 -translate-x-1/2 rounded-full blur-3xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.08))',
                        animation: 'shine2 15s ease-in-out infinite 3s'
                    }}
                />
                <div
                    className="absolute w-[550px] h-[550px] -bottom-48 left-1/4 rounded-full blur-3xl opacity-15"
                    style={{
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.1), rgba(249, 115, 22, 0.08))',
                        animation: 'shine3 18s ease-in-out infinite 6s'
                    }}
                />
            </div>
        </div>
    );
}