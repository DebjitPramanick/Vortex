import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/atoms/card";
import VxPieChart from "@components/charts/pie";
import { useApplicationStore } from "@store/useApplicationStore";
import { ChartHelper } from "@utils/charts.helper";
import { useEffect, useMemo } from "react";

function Dashboard() {
  const { applications, loading, error, fetchAll } = useApplicationStore();

  useEffect(() => {
    void fetchAll().catch(() => undefined);
  }, [fetchAll]);

  const { nApplicationsByLocation } = useMemo(() => {
    const chartHelper = new ChartHelper(applications);
    return {
      nApplicationsByLocation: chartHelper.numberOfApplicationsByLocation(),
    };
  }, [applications]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
      <div className="flex flex-shrink-0 flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="vx-page-title">Dashboard</h1>
          <p className="mt-1 text-[13px] text-vortex-secondary">
            See how your pipeline is distributed.
          </p>
        </div>
      </div>

      {error ? <p className="text-[13px] text-vortex-error">{error}</p> : null}

      <div className="grid min-h-0 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Applications by location</CardTitle>
              <CardDescription>
                Count of roles grouped by work location.
              </CardDescription>
            </div>
          </CardHeader>
          <CardBody>
            {loading ? (
              <p className="text-[13px] text-vortex-secondary">
                Loading chart…
              </p>
            ) : (
              <VxPieChart
                data={nApplicationsByLocation}
                nameKey="location"
                dataKey="count"
              />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
