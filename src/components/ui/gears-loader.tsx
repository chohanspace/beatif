
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const musicalNotesLoaderVariants = cva('flex items-center justify-center', {
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

export interface MusicalNotesLoaderProps
  extends React.SVGProps<SVGSVGElement>,
    VariantProps<typeof musicalNotesLoaderVariants> {}

export function MusicalNotesLoader({ className, size, ...props }: MusicalNotesLoaderProps) {
  return (
    <div className={cn(musicalNotesLoaderVariants({ size }), className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        className="h-full w-full"
        style={{ background: 'none' }}
        {...props}
      >
        <style>{`
          .note {
            animation-duration: 2s;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            transform-origin: 50% 50%;
          }
          .note-1 { animation-name: note-path-1; }
          .note-2 { animation-name: note-path-2; }
          .note-3 { animation-name: note-path-3; }

          @keyframes note-path-1 {
            0%   { opacity: 0; transform: translate(25px, 75px) scale(0.5); }
            25%  { opacity: 1; transform: translate(40px, 40px) scale(1); }
            50%  { opacity: 1; transform: translate(60px, 30px) scale(1); }
            75%  { opacity: 1; transform: translate(75px, 40px) scale(1); }
            100% { opacity: 0; transform: translate(80px, 75px) scale(0.5); }
          }
          @keyframes note-path-2 {
            0%   { opacity: 0; transform: translate(20px, 70px) scale(0.5); animation-timing-function: cubic-bezier(0.445, 0.050, 0.550, 0.950); }
            20%  { opacity: 1; }
            80%  { opacity: 1; }
            100% { opacity: 0; transform: translate(80px, 30px) scale(1.2); }
          }
          @keyframes note-path-3 {
            0%   { opacity: 0; transform: translate(75px, 25px) scale(0.5); animation-timing-function: cubic-bezier(0.445, 0.050, 0.550, 0.950); }
            20%  { opacity: 1; }
            80%  { opacity: 1; }
            100% { opacity: 0; transform: translate(25px, 75px) scale(1.2); }
          }
        `}</style>
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g transform="translate(5, 5)">
            <path d="M45,20 L45,60 C45,65.5228475 40.5228475,70 35,70 C29.4771525,70 25,65.5228475 25,60 C25,54.4771525 29.4771525,50 35,50 C36.353457,50 37.6251952,50.3117391 38.75,50.8655383" stroke="hsl(var(--primary))" strokeWidth="4"></path>
            <g className="note note-1" fill="hsl(var(--primary))">
              <circle cx="20" cy="80" r="5"></circle>
            </g>
            <g className="note note-2" fill="hsl(var(--primary))">
               <path d="M20,70 L20,30 C20,24.4771525 24.4771525,20 30,20 C35.5228475,20 40,24.4771525 40,30 C40,35.5228475 35.5228475,40 30,40"></path>
            </g>
             <g className="note note-3" fill="hsl(var(--primary))">
                <path d="M80,20 L80,60 C80,65.5228475 75.5228475,70 70,70 C64.4771525,70 60,65.5228475 60,60 C60,54.4771525 64.4771525,50 70,50"></path>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
