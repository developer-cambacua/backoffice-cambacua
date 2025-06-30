"use client";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface BarWithLabelsProps {
  chartData: any[];
  chartSize?: string;
  title: string;
  value: string;
  BarColor: string;
}

export function BarWithLabels({
  chartData,
  chartSize,
  title,
  value,
  BarColor,
}: BarWithLabelsProps) {
  return (
    <ChartContainer config={chartConfig} className={chartSize}>
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 20,
        }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={title}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(val) => val.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey={value} fill={BarColor} radius={4}>
          <LabelList
            position="top"
            offset={12}
            className="fill-foreground"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
