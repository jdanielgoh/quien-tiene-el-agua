import * as d3 from "d3";
import { useState, useEffect, useRef } from "react";

const margin = { top: 10, right: 20, bottom: 20, left: 20 };

const BrushTemporal = ({ onChange }) => {
  const brushRef = useRef(null);
  const montado = useRef(false); // Estado persistente

  const formatoTemporal = d3.timeParse("%Y-%m-%d");
  const formatoString = d3.timeFormat("%d-%m-%Y"); // Convierte de Date a string

  const [fecha_inicial, setFechaInicial] = useState(
    formatoTemporal("1990-01-01")
  );
  const [fecha_final, setFechaFinal] = useState(formatoTemporal("2025-01-01"));
  const escalaTemporal = d3.scaleTime();

  useEffect(() => {
    if (!brushRef.current) return; // Verificar si el ref existe antes de proceder

    const ancho = brushRef.current.clientWidth;
    const alto = 70;

    const svg = d3
      .select(brushRef.current)
      .select("svg")
      .attr("width", ancho)
      .attr("height", alto)
      .attr("viewBox", [0, 0, ancho, alto])
      .style("background", "rgb(20,20,20)");

    // Crear la escala de tiempo
    escalaTemporal
      .domain([formatoTemporal("1990-01-01"), formatoTemporal("2025-01-01")])
      .range([margin.left, ancho - margin.right]);

    // Crear y configurar el eje
    const eje = svg
      .select("g.eje")
      .attr("transform", `translate(0,${alto - margin.bottom})`)
      .call(d3.axisBottom(escalaTemporal));

    eje.selectAll("line").style("stroke", "#fff");
    eje.selectAll("path").style("stroke", "#fff");
    eje.selectAll("text").style("fill", "#fff");

    // Crear el brush
    const brush = d3
      .brushX()
      .extent([
        [margin.left, margin.top],
        [ancho - margin.right, alto - margin.bottom],
      ])
      .on("end", brushed);

    // Aplicar el brush al grupo SVG
    const brushGroup = svg.select("g.brush").call(brush);

    // Establecer una selección inicial solo la primera vez
    if (!montado.current) {
      brushGroup.call(brush.move, [
        escalaTemporal(fecha_inicial),
        escalaTemporal(fecha_final),
      ]);
      montado.current = true; // Marcar como inicializado
    }

    function brushed({ selection }) {
      if (!selection) return; // Si no hay selección, salir

      const nuevaFechaInicial = escalaTemporal.invert(selection[0]);
      const nuevaFechaFinal = escalaTemporal.invert(selection[1]);

      setFechaInicial(nuevaFechaInicial);
      setFechaFinal(nuevaFechaFinal);

      // Pasar las fechas actualizadas al padre
      onChange({
        fecha_inicio: nuevaFechaInicial,
        fecha_final: nuevaFechaFinal,
      });
    }
  }, []); // Solo ejecutar una vez después del montaje

  return (
    <div>
      <div ref={brushRef}>
        fecha inicial: {formatoString(fecha_inicial)} <br></br>
        fecha final: {formatoString(fecha_final)}
        <svg>
          <g className="brush"></g>
          <g className="eje"></g>
        </svg>
      </div>
    </div>
  );
};

export default BrushTemporal;
