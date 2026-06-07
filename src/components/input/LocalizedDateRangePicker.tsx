import type { DateRangePickerProps } from "@tremor/react";
import { DateRangePicker, DateRangePickerItem } from "@tremor/react";
import { de, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { subDays, startOfMonth, startOfYear } from "date-fns";

type LocalizedDateRangePickerProps = DateRangePickerProps &
  React.RefAttributes<HTMLDivElement>;

export default function LocalizedDateRangePicker({
  ...props
}: LocalizedDateRangePickerProps) {
  const { t, i18n } = useTranslation();

  const locale = i18n.language === "de" ? de : enUS;

  const today = new Date();
  const last7DaysStart = subDays(today, 7);
  const last30DaysStart = subDays(today, 30);
  const monthToDateStart = startOfMonth(today);
  const yearToDateStart = startOfYear(today);

  return (
    <DateRangePicker
      placeholder={t("dateRange.selectDates")}
      selectPlaceholder={t("dateRange.selectRange")}
      {...props}
      locale={locale}
    >
      <DateRangePickerItem
        key="today"
        value="today"
        from={subDays(today, 1)}
        to={today}
      >
        {t("dateRange.today")}
      </DateRangePickerItem>

      <DateRangePickerItem
        key="last7Days"
        value="last7Days"
        from={last7DaysStart}
        to={today}
      >
        {t("dateRange.last7Days")}
      </DateRangePickerItem>

      <DateRangePickerItem
        key="last30Days"
        value="last30Days"
        from={last30DaysStart}
        to={today}
      >
        {t("dateRange.last30Days")}
      </DateRangePickerItem>

      <DateRangePickerItem
        key="monthToDate"
        value="monthToDate"
        from={monthToDateStart}
        to={today}
      >
        {t("dateRange.monthToDate")}
      </DateRangePickerItem>

      <DateRangePickerItem
        key="yearToDate"
        value="yearToDate"
        from={yearToDateStart}
        to={today}
      >
        {t("dateRange.yearToDate")}
      </DateRangePickerItem>
    </DateRangePicker>
  );
}
