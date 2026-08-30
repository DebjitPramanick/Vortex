import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/atoms/card";
import VxBarChart from "@components/charts/bar";
import VxPieChart from "@components/charts/pie";
import { useApplicationStore } from "@store/useApplicationStore";
import { ChartDataProcessor } from "@services";
import { useEffect, useMemo } from "react";

function Dashboard() {
  const { applications, loading, error, fetchAll } = useApplicationStore();

  useEffect(() => {
    void fetchAll().catch(() => undefined);
  }, [fetchAll]);

  const {
    nApplicationsByLocation,
    nApplicationsByStatus,
    applicationsInLast30Days,
    nApplicationsByResumeScore,
  } = useMemo(() => {
    const chartDataProcessor = new ChartDataProcessor(applications);
    return {
      nApplicationsByLocation:
        chartDataProcessor.numberOfApplicationsByLocation(),
      nApplicationsByStatus: chartDataProcessor.numberOfApplicationsByStatus(),
      applicationsInLast30Days:
        chartDataProcessor.numberOfApplicationsByDay(30),
      nApplicationsByResumeScore:
        chartDataProcessor.numberOfApplicationsByResumeScore(),
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

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Applications by status</CardTitle>
              <CardDescription>
                Count of roles grouped by pipeline stage.
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
                data={nApplicationsByStatus}
                nameKey="statusLabel"
                dataKey="count"
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Applications by resume score</CardTitle>
              <CardDescription>
                Count of roles grouped by resume score.
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
                data={nApplicationsByResumeScore}
                nameKey="label"
                dataKey="value"
              />
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Applications by day</CardTitle>
              <CardDescription>
                Applied roles over the last 30 days.
              </CardDescription>
            </div>
          </CardHeader>
          <CardBody>
            {loading ? (
              <p className="text-[13px] text-vortex-secondary">
                Loading chart…
              </p>
            ) : (
              <VxBarChart
                data={applicationsInLast30Days}
                nameKey="label"
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
