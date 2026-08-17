export default function DashboardLoading() {
    return (
      <div className="mx-auto w-full max-w-[1540px]">
        <div className="dashboard-skeleton h-7 w-36 rounded-full" />
  
        <div className="dashboard-skeleton mt-5 h-10 w-72 max-w-full rounded-xl" />
  
        <div className="dashboard-skeleton mt-3 h-5 w-[520px] max-w-full rounded-lg" />
  
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="dashboard-skeleton h-32 rounded-2xl"
            />
          ))}
        </div>
  
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
          <div className="dashboard-skeleton h-[520px] rounded-3xl" />
  
          <div className="dashboard-skeleton h-[520px] rounded-3xl" />
        </div>
      </div>
    );
  }