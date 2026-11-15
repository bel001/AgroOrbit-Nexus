"use client";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Climate } from "@/lib/model";
import { monthlyClimate } from "@/lib/power";
import { useT } from "./i18n";
export default function ClimateChart({ climate }: { climate: Climate }) {
  const t = useT();
  const data = monthlyClimate(climate);
  return <><div className="chart" role="img" aria-label={t("Temperatura media mensual y precipitación mensual. Valores y completitud en la tabla siguiente.", "Monthly mean temperature and monthly rainfall. Values and completeness in the table below.")}>
    <ResponsiveContainer width="100%" height="100%"><ComposedChart data={data} margin={{ top: 15, right: 10, left: 0, bottom: 10 }}>
      <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#dde5dd" /><XAxis dataKey="month" tick={{ fontSize: 12 }} minTickGap={28} />
      <YAxis yAxisId="t" unit=" °C" width={64} /><YAxis yAxisId="p" orientation="right" unit=" mm" width={70} />
      <Tooltip formatter={(value) => typeof value === "number" ? value.toFixed(2) : t("Sin datos", "No data")} /><Legend />
      <Bar yAxisId="p" dataKey="rain" name={t("Precipitación de grilla (mm)", "Grid rainfall (mm)")} fill="#3f87b5" radius={[4, 4, 0, 0]} maxBarSize={22} animationDuration={700} />
      <Line yAxisId="t" dataKey="temperature" name={t("Temperatura media (°C)", "Mean temperature (°C)")} stroke="#1f6b4f" strokeWidth={2.5} dot={false} connectNulls={false} animationDuration={900} />
    </ComposedChart></ResponsiveContainer>
  </div><details className="soft-details"><summary>{t("Ver tabla mensual y días válidos", "Show monthly table and valid days")}</summary><div className="table-scroll" tabIndex={0} role="region" aria-label={t("Tabla climática desplazable", "Scrollable climate table")}><table><caption>{t("Agregaciones históricas. Lluvia = suma de días válidos; temperatura = media de días válidos. Los meses inicial/final pueden ser parciales.", "Historical aggregates. Rain = sum of valid days; temperature = mean of valid days. First/last months may be partial.")}</caption><thead><tr><th>{t("Mes", "Month")}</th><th>{t("Temperatura (°C)", "Temperature (°C)")}</th><th>{t("Lluvia (mm)", "Rain (mm)")}</th><th>{t("Días T / lluvia / periodo", "Days T / rain / period")}</th></tr></thead><tbody>{data.map(d => <tr key={d.month}><th>{d.month}</th><td>{d.temperature?.toFixed(2) ?? t("Sin datos", "No data")}</td><td>{d.rain?.toFixed(2) ?? t("Sin datos", "No data")}</td><td>{d.validTemperature} / {d.validRain} / {d.days}</td></tr>)}</tbody></table></div></details></>;
}
