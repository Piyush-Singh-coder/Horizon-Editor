const RunningCodeSkeleton = () => (
  <div className="space-y-4 animate-pulse w-full max-w-sm">
    <div className="space-y-2.5">
      <div className="h-3.5 bg-border-primary rounded-lg w-3/4" />
      <div className="h-3.5 bg-border-primary rounded-lg w-1/2" />
      <div className="h-3.5 bg-border-primary rounded-lg w-5/6" />
    </div>

    <div className="space-y-2.5 pt-4">
      <div className="h-3.5 bg-border-primary rounded-lg w-2/3" />
      <div className="h-3.5 bg-border-primary rounded-lg w-4/5" />
      <div className="h-3.5 bg-border-primary rounded-lg w-3/4" />
    </div>
  </div>
);

export default RunningCodeSkeleton;
