function createChart(information) {
    if (information) {
        const canvas = document.createElement("canvas");
        canvas.id = "chartStation";

        let ctx = canvas.getContext('2d');
        ctx.fillStyle = "#FFF"
        let data = {
            labels: [],
            datasets: [{
                label: 'AQI',
                data: [],
                backgroundColor: [],
                borderWidth: 1,
            }]
        };

        information.forEach(function (item) {
            data.labels.push(new Date(item.time).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }));
            data.datasets[0].data.push(item.count);
            // Determine color based on the count or AQI index
            const color = determineColor(item.count); // or determineColor(item.aqi)
            data.datasets[0].backgroundColor.push(color);
        });

        new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                legend: {
                    labels: {
                        fontColor: "white"
                    }
                },
                scales: {
                    y: {
                        fontColor: "white",
                        beginAtZero: true
                    }
                }
            }
        });
        return canvas;
    }
}

function determineColor(value) {
    // Define color ranges based on the value
    if (value < 50) {
        return 'green';
    } else if (value < 100) {
        return 'yellow';
    } else if (value < 150) {
        return 'orange';
    } else {
        return 'red';
    }
}
