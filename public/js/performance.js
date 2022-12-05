Chart.defaults.color = "#000000";
//get the queries from the url
const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

window.addEventListener('load', function () {
    createPerformanceChat(params.sessionPrecision,params.sessionTPR,params.sessionFNR,params.cumPrecision,params.cumTPR,params.cumFNR);
    if(window.localStorage.getItem("sessionFinished")=="true"){
        document.getElementById("button").innerHTML =`<form action="/sessionFinished" align="right"> <input type="submit" value="end the session"/></form>`;
    }else{
        document.getElementById("button").innerHTML  =`<form action="/experiment" align="right" > <input type="submit" value="continue the experiment" /></form>`;
    }
})


function createPerformanceChat(sPrecision, sTpr, sFpr, precision, tpr, fpr) {
    const ctx = document.getElementById('myChart').getContext('2d');
    var labels = ["precision","true positive", "false positive"];
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [

                {
                    label: "all sessions (cumulative)",
                    data: [precision, tpr, fpr],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.5)',,
                    ],
                    borderColor: [
                        'rgba(54, 162, 235)',
                    ],
                    borderWidth: 1
                },
            ],
            
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        format: {
                            style: 'percent'
                        }
                    }
                    
                }
            }
        }
    });
}