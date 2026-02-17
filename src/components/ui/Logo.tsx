export function Logo({ className }: { className?: string }) {
    return (
        <div className={className}>
            <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-blue-600"
            >
                <path
                    d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28C22.6274 28 28 22.6274 28 16"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
                <circle cx="16" cy="16" r="6" fill="currentColor" fillOpacity="0.2" />
                <circle cx="16" cy="16" r="2" fill="currentColor" />
            </svg>
            {/* 
        Concept: 
        - Outer open circle = The open mind/processing
        - Inner aura = The noise being contained
        - Center dot = The single point of clarity
      */}
        </div>
    )
}
