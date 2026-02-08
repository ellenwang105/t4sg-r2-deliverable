/* eslint-disable */
"use client";
import { useRef, useEffect, useState  } from "react";
import { select } from "d3-selection";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis"; // D3 is a JavaScript library for data visualization: https://d3js.org/
import { csv } from "d3-fetch";

// Define the AnimalDatum interface
interface AnimalDatum  {
  name: string;
  speed: number;
  diet: "herbivore" | "omnivore" | "carnivore";
}

export default function AnimalSpeedGraph() {
  // useRef creates a reference to the div where D3 will draw the chart.
  // https://react.dev/reference/react/useRef
  const graphRef = useRef<HTMLDivElement>(null);

  const [animalData, setAnimalData] = useState<AnimalDatum[]>([]);

  // Load CSV data
  useEffect(() => {
    csv("/sample_animals.csv").then((data) => {
      const processed: AnimalDatum[] = data
        .map((row) => {
          const speed = parseFloat(row["Top Speed (km/h)"] || "");
          const diet = (row.Diet || "").toLowerCase().trim();
          const animal = row.Animal || "";
          
          // Filter out invalid data and ensure diet is one of the three valid types
          if (
            isNaN(speed) ||
            !animal ||
            (diet !== "herbivore" && diet !== "omnivore" && diet !== "carnivore")
          ) {
            return null;
          }

          return {
            name: animal,
            speed: speed,
            diet: diet as "herbivore" | "omnivore" | "carnivore",
          };
        })
        .filter((item): item is AnimalDatum => item !== null);

      // Select representative animals: top 5 from each diet category
      // This ensures we show interesting data without overwhelming the chart
      const herbivores = processed
        .filter((a) => a.diet === "herbivore")
        .sort((a, b) => b.speed - a.speed)
        .slice(0, 5);
      
      const omnivores = processed
        .filter((a) => a.diet === "omnivore")
        .sort((a, b) => b.speed - a.speed)
        .slice(0, 5);
      
      const carnivores = processed
        .filter((a) => a.diet === "carnivore")
        .sort((a, b) => b.speed - a.speed)
        .slice(0, 5);

      // Combine and sort by speed for better visualization
      const selected = [...herbivores, ...omnivores, ...carnivores]
        .sort((a, b) => b.speed - a.speed);

      setAnimalData(selected);
    }).catch((error) => {
      console.error("Error loading CSV:", error);
    });
  }, []);

  useEffect(() => {
    // Clear any previous SVG to avoid duplicates when React hot-reloads
    if (graphRef.current) {
      graphRef.current.innerHTML = "";
    }

    if (animalData.length === 0) return;

    // Set up chart dimensions and margins
    const containerWidth = graphRef.current?.clientWidth ?? 800;
    const containerHeight = graphRef.current?.clientHeight ?? 500;

    // Set up chart dimensions and margins
    const width = Math.max(containerWidth, 600); // Minimum width of 600px
    const height = Math.max(containerHeight, 400); // Minimum height of 400px
    const margin = { top: 70, right: 150, bottom: 150, left: 100 };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create the SVG element where D3 will draw the chart
    // https://github.com/d3/d3-selection
    const svg = select(graphRef.current!)
      .append<SVGSVGElement>("svg")
      .attr("width", width)
      .attr("height", height);

    // Create a group for the chart area
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    // X-axis: band scale for animal names
    const xScale = scaleBand()
      .domain(animalData.map((d) => d.name))
      .range([0, chartWidth])
      .padding(0.2);

    // Y-axis: linear scale for speeds
    const maxSpeed = max(animalData, (d) => d.speed) ?? 120;
    const yScale = scaleLinear()
      .domain([0, maxSpeed * 1.1]) // Add 10% padding at top
      .range([chartHeight, 0]);

    // Color scale: ordinal scale for diet types
    const colorScale = scaleOrdinal<string>()
      .domain(["herbivore", "omnivore", "carnivore"])
      .range(["#22c55e", "#eab308", "#ef4444"]); // Green, Yellow, Red

    // Create bars
    g.selectAll<SVGRectElement, AnimalDatum>("rect")
      .data(animalData)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.name) ?? 0)
      .attr("y", (d) => yScale(d.speed))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => chartHeight - yScale(d.speed))
      .attr("fill", (d) => colorScale(d.diet))
      .attr("stroke", "#1f2937")
      .attr("stroke-width", 1);

    // Create x-axis
    const xAxis = axisBottom(xScale);
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .attr("dx", "-0.5em")
      .attr("dy", "0.5em")
      .style("fill", "#e5e7eb")
      .style("font-size", "12px");

    // Create y-axis
    const yAxis = axisLeft(yScale);
    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .style("fill", "#e5e7eb")
      .style("font-size", "12px");

    // Add axis titles
    // X-axis title
    g.append("text")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 105})`)
      .style("text-anchor", "middle")
      .style("fill", "#e5e7eb")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .text("Animal");

    // Y-axis title
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 35)
      .attr("x", -chartHeight / 2)
      .style("text-anchor", "middle")
      .style("fill", "#e5e7eb")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .text("Speed (km/h)");

    // Create legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);

    const diets: Array<{ label: string; value: "herbivore" | "omnivore" | "carnivore" }> = [
      { label: "Herbivore", value: "herbivore" },
      { label: "Omnivore", value: "omnivore" },
      { label: "Carnivore", value: "carnivore" },
    ];

    const legendItems = legend
      .selectAll<SVGGElement, typeof diets[0]>("g")
      .data(diets)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    legendItems
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d) => colorScale(d.value))
      .attr("stroke", "#1f2937")
      .attr("stroke-width", 1);

    legendItems
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("fill", "#e5e7eb")
      .style("font-size", "12px")
      .text((d) => d.label);
  }, [animalData]);

  // Return the graph container
  return (
    <div
      ref={graphRef}
      className="w-full h-[500px] min-h-[400px] bg-gray-900 rounded-lg p-4"
    />
  );
}
