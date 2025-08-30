import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const gearsLoaderVariants = cva('flex items-center justify-center', {
  variants: {
    size: {
      default: 'h-10 w-10',
      sm: 'h-6 w-6',
      lg: 'h-16 w-16',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface GearsLoaderProps
  extends React.SVGProps<SVGSVGElement>,
    VariantProps<typeof gearsLoaderVariants> {}

export function GearsLoader({ className, size, ...props }: GearsLoaderProps) {
  return (
    <div className={cn(gearsLoaderVariants({ size }), className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        className="h-full w-full"
        style={{ background: 'none' }}
        {...props}
      >
        <style>{`
          @keyframes gear-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes gear-rotate-reverse {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }
          .gear-1 {
            animation: gear-rotate 4s linear infinite;
            transform-origin: 32px 33px;
          }
          .gear-2 {
            animation: gear-rotate-reverse 2s linear infinite;
            transform-origin: 72px 33px;
          }
          .gear-3 {
            animation: gear-rotate 4s linear infinite;
            transform-origin: 32px 73px;
          }
           .gear-4 {
            animation: gear-rotate-reverse 2s linear infinite;
            transform-origin: 72px 73px;
          }
        `}</style>
        <g transform="translate(0,-7.5)">
          <g className="gear-1">
            <path
              d="M32,33.5A7.5,7.5,0,0,1,24.5,41v-15A7.5,7.5,0,0,1,32,33.5Z"
              fill="hsl(var(--primary))"
            />
            <path
              d="M32,33.5A7.5,7.5,0,0,1,39.5,41v-15A7.5,7.5,0,0,1,32,33.5Z"
              transform="rotate(60,32,33)"
              fill="hsl(var(--primary))"
            />
            <path
              d="M32,33.5A7.5,7.5,0,0,1,39.5,41v-15A7.5,7.5,0,0,1,32,33.5Z"
              transform="rotate(120,32,33)"
              fill="hsl(var(--primary))"
            />
            <circle cx="32" cy="33" r="5" fill="hsl(var(--background))" />
          </g>
          <g className="gear-2">
            <path
              d="M72,33.5A7.5,7.5,0,0,1,64.5,41v-15A7.5,7.5,0,0,1,72,33.5Z"
              fill="hsl(var(--primary))"
            />
            <path
              d="M72,33.5A7.5,7.5,0,0,1,79.5,41v-15A7.5,7.5,0,0,1,72,33.5Z"
              transform="rotate(60,72,33)"
              fill="hsl(var(--primary))"
            />
            <path
              d="M72,33.5A7.5,7.5,0,0,1,79.5,41v-15A7.5,7.5,0,0,1,72,33.5Z"
              transform="rotate(120,72,33)"
              fill="hsl(var(--primary))"
            />
            <circle cx="72" cy="33" r="5" fill="hsl(var(--background))" />
          </g>
          <g className="gear-3">
            <path
              d="M32,73.5A7.5,7.5,0,0,1,24.5,81v-15A7.5,7.5,0,0,1,32,73.5Z"
              fill="hsl(var(--primary))"
            />
            <path
              d="M32,73.5A7.5,7.5,0,0,1,39.5,81v-15A7.5,7.5,0,0,1,32,73.5Z"
              transform="rotate(60,32,73)"
              fill="hsl(var(--primary))"
            />
            <path
              d="M32,73.5A7.5,7.5,0,0,1,39.5,81v-15A7.5,7.5,0,0,1,32,73.5Z"
              transform="rotate(120,32,73)"
              fill="hsl(var(--primary))"
            />
            <circle cx="32" cy="73" r="5" fill="hsl(var(--background))" />
          </g>
           <g className="gear-4">
            <path
              d="M72,73.5A7.5,7.5,0,0,1,64.5,81v-15A7.5,7.5,0,0,1,72,73.5Z"
              fill="hsl(var(--primary))"
            />
            <path
              d="M72,73.5A7.5,7.5,0,0,1,79.5,81v-15A7.5,7.5,0,0,1,72,73.5Z"
              transform="rotate(60,72,73)"
              fill="hsl(var(--primary))"
            />
            <path
              d="M72,73.5A7.5,7.5,0,0,1,79.5,81v-15A7.5,7.5,0,0,1,72,73.5Z"
              transform="rotate(120,72,73)"
              fill="hsl(var(--primary))"
            />
            <circle cx="72" cy="73" r="5" fill="hsl(var(--background))" />
          </g>
        </g>
      </svg>
    </div>
  );
}
