"use client";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Climate } from "@/lib/model";
import { monthlyClimate } from "@/lib/power";
export default function ClimateChart({ climate }: { climate: Climate }) {
  const data = monthlyClimate(climate);
  return <><div className="chart" role="img" aria-label="Temperatura media mensual y precipitación mensual. Valores y completitud en la tabla siguiente.">
    <ResponsiveContainer width="100%" height="100%"><ComposedChart data={data} margin={{ top: 15, right: 10, left: 0, bottom: 10 }}>
      <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#cbd4c9" /><XAxis dataKey="month" tick={{ fontSize: 12 }} minTickGap={28} />
      <YAxis yAxisId="t" unit=" °C" width={64} /><YAxis yAxisId="p" orientation="right" unit=" mm" width={70} />
      <Tooltip formatter={(value) => typeof value === "number" ? value.toFixed(2) : "Sin datos"} /><Legend />
      <Bar yAxisId="p" dataKey="rain" name="Precipitación de grilla (mm)" fill="#527b60" maxBarSize={24} isAnimationActive={false} />
      <Line yAxisId="t" dataKey="temperature" name="Temperatura media (°C)" stroke="#21634b" strokeWidth={2.5} dot={false} connectNulls={false} isAnimationActive={false} />
    </ComposedChart></ResponsiveContainer>
  </div><details><summary>Ver tabla mensual y días válidos</summary><div className="table-scroll" tabIndex={0} role="region" aria-label="Tabla climática desplazable"><table><caption>Agregaciones históricas. Lluvia = suma de días válidos; temperatura = media de días válidos. Los meses inicial/final pueden ser parciales.</caption><thead><tr><th>Mes</th><th>Temperatura (°C)</th><th>Lluvia (mm)</th><th>Días T / lluvia / periodo</th></tr></thead><tbody>{data.map(d => <tr key={d.month}><th>{d.month}</th><td>{d.temperature?.toFixed(2) ?? "Sin datos"}</td><td>{d.rain?.toFixed(2) ?? "Sin datos"}</td><td>{d.validTemperature} / {d.validRain} / {d.days}</td></tr>)}</tbody></table></div></details></>;
}
