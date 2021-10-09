$(document).ready(function () {
    
    // set the feather icons
    feather.replace();

    // Perform a check whether the user is registered upon page load
    check_user_reg();

    // Initialize the reference mean NJS line values for each exercise
    var bottle_mean=[0.0008400281111111111];
    var mug_mean=[0.0007332486993154762];
    // var key_mean=[0.0010958718019444444];
    // var pen_mean=[0.00100059931875]; old
    var pen_mean=[0.0014725709055555555];
    var card_mean=[0.0016011028972222222];

    // mean_prime is passed to the chart js live graph and is initialized with above mean values based on selected exercise
    var mean_prime=[];

// Button to begin video recording and update the live graph realtime
var state = false;
$("#btnradio1").click(function() {
    const config = {
        type: 'line',
        data: {
            labels: [],
            datasets: [
            {
          label: "User NJS averaged",
          backgroundColor: 'rgb(4, 28, 138)',
          borderColor: 'rgb(4, 28, 138)',
          data: [],
          fill: false,
        },
        {
            label: "Ideal NJS Zone (Stay Within The Grey zone)",
            backgroundColor: 'rgb(206, 205, 212)',
            borderColor: 'rgb(0, 0, 0)',
            data: [],
            fill: true,
          }
        ],
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'NJS Score Mapping'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    ticks:{
                        // suggestedMin: 0,
                        suggestedMax: 25
                        },
                    scaleLabel: {
                        display: true,
                        labelString: 'Time (Number Of Seconds)'
                    }
                }],
                yAxes: [{
                    display: true,
                    ticks:{
                    suggestedMin: 0,
                    suggestedMax: 0.003
                    },
                    // type: 'linear',
                    scaleLabel: {
                        display: true,
                        labelString: 'Value'
                    }
                }]
            }
        }
    };

    state = !state;
    
    // alert('clicked');
    //code to turn on visualization when the video recording starts
    const context = document.getElementById('canvas').getContext('2d');

const lineChart = new Chart(context, config);

const source = new EventSource("/chartdata");

source.onmessage = function (event) {
    
    const data = JSON.parse(event.data);
    console.log(data.user_mean_jrk);
    if (config.data.labels.length === 20) {
        // config.data.labels.shift();
        // config.data.datasets[0].data.shift();
    }
    config.data.labels.push(data.time);
    // config.data.datasets[0].data.push(data.value);
    console.log(data.user_mean_jrk);
    if(data.user_mean_jrk){
        console.log(data.user_mean_jrk);
        config.data.datasets[0].data.push(data.user_mean_jrk);
        config.data.datasets[1].data.push(mean_prime);
        console.log(mean_prime);
    }
    if(data.quality=='GOING GOOD!'){
        console.log(data.quality);
        document.getElementById("quality").innerHTML = '<div class="alert alert-primary" role="alert">'+data.quality+'</div>';
        lineChart.update();
    }
    else if(data.quality=='TOO JERKY!'){
        console.log(data.quality);
        var x = document.getElementById("myAudio");
        x.play();
        document.getElementById("quality").innerHTML = '<div class="alert alert-primary" role="alert">'+data.quality+'</div>';
        lineChart.update();
    }
    
    // success status to close the data stream
    else if(data.message === 'no')
    {
        console.log(data.message);
        source.close();
        // alert("Your data has been submitted successfully");
        var bng='<div class="alert alert-success" role="alert">Great! Your data has been submitted successfully</div>';
        document.getElementById("quality").innerHTML = bng;
        lineChart.destroy();
    }

    // In case user credentials are missing, close the stream and prompt user to re- register.
    else if(data.message === 'no_valid')
    {
        console.log(data.message);
        source.close();
        // alert("The user's login credentials were not found");
        var bng='<div class="alert alert-danger" role="alert">Your user credentials were not found. Please re-register</div>';
        document.getElementById("quality").innerHTML = bng;
        lineChart.destroy();
    }

    else if(data.message === 'keyfail')
    {
        console.log(data.message);
        source.close();
        // alert("The user's login credentials were not found");
        var bng='<div class="alert alert-danger" role="alert">Submission failed. Problem authenticating your key. Please reach out to program supervisor ASAP.</div>';
        document.getElementById("quality").innerHTML = bng;
        lineChart.destroy();
    }

    // In case the server connection fails, close the stream and inform user
    else if(data.message === 'connectfail')
    {
        console.log(data.message);
        source.close();
        // alert("The user's login credentials were not found");
        var bng='<div class="alert alert-danger" role="alert">Submission failed. Problem connecting to the server. Please restart. If problem persists, reach out to program supervisor</div>';
        document.getElementById("quality").innerHTML = bng;
        lineChart.destroy();
    }
    
    }

 
});

// function to set the exercise and initialize reference NJS avg values (dnd)
// console.log("Before set excercise")
$("input[name='exercise']").click(function() //fetch_ref_data()
{
  var exval = $("input[name='exercise']:checked").val();
  var req_dict={}
  console.log(exval);
  if(exval){

    if (exval=='bottle'){mean_prime=bottle_mean}
    else if (exval=='mug'){mean_prime=mug_mean}
    // else if (exval=='key'){mean_prime=key_mean}
    else if (exval=='pen'){mean_prime=pen_mean}
    else if (exval=='card'){mean_prime=card_mean}  
    req_dict.exname=exval;
    console.log(JSON.stringify(req_dict));
    console.log("in set exercise");
      $.ajax({
        url: "http://127.0.0.1:5000/setexercise",
        type: 'POST',
        data: JSON.stringify(req_dict),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
          console.log(response);
        }
      });
    }
});
});

// Code for one time form submission data for which is stored in a json file in user_reg directory (dnd)
function submitData(){
    var uid = document.getElementById('inputuserid4').value;
    var age = document.getElementById('inputage4').value;
    console.log(age)
    var subm = {};
    subm.userid=uid;
    subm.age=age;
    console.log(subm);

    var myJSON = JSON.stringify(subm);
    console.log(myJSON);
    $.ajax({
        url: "http://127.0.0.1:5000/onetimeform/",
        type: 'POST',
        data: myJSON,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
          console.log(response);
          var temp=response["report"];
          console.log(temp);
          document.getElementById("result1").innerHTML = temp;
        }
    });

}

// check if the user registration json file exists and validate it upon page load
function check_user_reg(){
    var ucheck={}
    ucheck.msg='checking'
    var myJSON = JSON.stringify(ucheck);
    console.log(myJSON);
    $.ajax({
        url: "http://127.0.0.1:5000/checkuserreg/",
        type: 'POST',
        data: myJSON,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
          console.log(response);
          var temp=response["report"];
          var temp2=response["flag"];
          console.log(temp2);
          if (temp2 == "yes"){
            $("#form1").hide();
          }
          document.getElementById("result02").innerHTML = '<div class="alert alert-primary" role="alert">'+temp+'</div>';
        }
    });
}