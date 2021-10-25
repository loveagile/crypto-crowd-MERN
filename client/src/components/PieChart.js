import { React, useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";

function Chart(props) {
  const [chartData, setChartData] = useState({});

  // Make sure data for pie chart is ordered in array as
  // [positive, negative, neutral]
  useEffect(() => {
    let arrayData = [];
    arrayData.push(props.distributionData.positive);
    arrayData.push(props.distributionData.negative);
    arrayData.push(props.distributionData.neutral);
    setChartData(arrayData);
  }, [props.distributionData]);

  // Format data for chart.js
  const data = {
    labels: [" Positive", " Negative", " Neutral"],
    datasets: [
      {
        data: chartData,
        backgroundColor: ["#36A2EB", "#FF6384", "#FDDA83"],
        hoverOffset: 4,
      },
    ],
    borderColor: "#fff",
  };

  return (
    <div className="chart container my-5">
      <Pie
        data={data}
        width={3}
        height={3}
        options={{
          legend: { display: false },
          title: { display: true, text: "Açılan Sandık" },
        }}
      />
    </div>
  );
}

export default Chart;
