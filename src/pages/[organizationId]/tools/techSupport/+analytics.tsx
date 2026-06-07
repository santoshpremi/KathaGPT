import { Typography } from "@mui/joy";
import type { DateRangePickerValue } from "@tremor/react";
import {
  BarChart,
  Card,
  Dialog,
  DialogPanel,
  Metric,
  Text,
  Title,
} from "@tremor/react";
import { endOfDay, format, parseISO, startOfDay, subDays } from "date-fns";
import { de, enUS, es, fr, it } from "date-fns/locale";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LocalizedDateRangePicker from "../../../../components/input/LocalizedDateRangePicker";
import { useTechSupportAnalytics } from "../../../../lib/api/localHooks";
import { useModals } from "../../../../router";

function getLocale(key: string) {
  const locale = {
    de: de,
    fr: fr,
    it: it,
    es: es,
  }[key];
  return locale ?? enUS;
}

export default function Route() {
  return <TechSupportAnalyticsModal />;
}

function TechSupportAnalyticsModal() {
  const { t, i18n } = useTranslation();

  const modals = useModals();

  const [dateRange, setDateRange] = useState<DateRangePickerValue>({
    from: startOfDay(subDays(new Date(), 30)),
    to: endOfDay(new Date()),
    selectValue: "last_30_days",
  });

  const { data: analytics } = useTechSupportAnalytics(
    dateRange.from!.toISOString(),
    dateRange.to!.toISOString(),
  );

  const locale = getLocale(i18n.language);

  const problemSolvedKey = t("techSupport.analytics.problemSolved");
  const ticketCreatedKey = t("techSupport.analytics.ticketCreated");
  const unknownKey = t("techSupport.analytics.unknown");

  const chartData =
    analytics?.solvedRequestsByDay.map((item) => ({
      day: format(parseISO(item.day), "P", { locale }),
      [problemSolvedKey]: item.solved_requests,
      [ticketCreatedKey]: item.tickets_created,
      [unknownKey]: item.unknown_outcome,
    })) ?? [];

  let successRate = 0;
  if (analytics != null) {
    successRate = analytics?.totalIssuesSolved / analytics?.totalRequests;
  }

  return (
    <Dialog open={true} onClose={() => modals.close()}>
      <DialogPanel className="flex max-w-min flex-col gap-4">
        <div className="flex justify-between">
          <Typography level="h3">{t("techSupport.analytics.title")}</Typography>
          <LocalizedDateRangePicker
            className="min-w-min"
            weekStartsOn={1}
            enableYearNavigation={false}
            value={dateRange}
            onValueChange={(v) => setDateRange(v)}
            enableClear={false}
            defaultValue={{ selectValue: "last_30_days" }}
          />
        </div>
        <Text>{t("techSupport.analytics.supportRequests")}</Text>
        <div className="flex gap-4">
          <Card>
            <Title>{t("techSupport.analytics.total")}</Title>
            <Metric>{analytics?.totalRequests}</Metric>
          </Card>
          <Card>
            <Title>{t("techSupport.analytics.problemSolved")}</Title>
            <Metric>{analytics?.totalIssuesSolved}</Metric>
          </Card>
          <Card>
            <Title>{t("techSupport.analytics.unknown")}</Title>
            <Metric>{analytics?.unknownOutcome}</Metric>
          </Card>
          <Card>
            <Title className="whitespace-nowrap">
              {t("techSupport.analytics.ticketCreated")}
            </Title>
            <Metric>{analytics?.totalTicketsCreated}</Metric>
          </Card>
          <Card>
            <Title>{t("techSupport.analytics.successQuota")}</Title>
            <Metric>
              {Number.isNaN(successRate)
                ? "-"
                : successRate.toLocaleString("de", { style: "percent" })}
            </Metric>
          </Card>
        </div>
        <BarChart
          categories={[
            t("techSupport.analytics.problemSolved"),
            t("techSupport.analytics.unknown"),
            t("techSupport.analytics.ticketCreated"),
          ]}
          data={chartData}
          index="day"
          stack
          colors={["green-500", "slate-500", "red-500"]}
          noDataText={t("techSupport.analytics.noData")}
        />
      </DialogPanel>
    </Dialog>
  );
}
