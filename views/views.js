var intro = {
    name: 'intro',
    // introduction title
    "title": "Welcome!",
    // introduction text
    "text": "Thank you for participating in our study. In this study, you will see lists of expressions. We ask to you rate how frequent you think they are.",
    // introduction's slide proceeding button text
    "buttonText": "Begin experiment",
    // render function renders the view
    render: function() {
        
        viewTemplate = $('#intro-view').html();
        $('#main').html(Mustache.render(viewTemplate, {
            title: this.title,
            text: this.text,
            button: this.buttonText
        }));

        // moves to the next view
        $('#next').on('click', function(e) {
            exp.findNextView();
        });

    },
    // for how many trials should this view be repeated?
    trials: 1
};

var instructions = {
    name: 'instructions',
    // instruction's title
    "title": "Instructions",
    // instruction's text
    "text": "On each trial, you will see a number of expressions. Please adjust a slider for each expression based on how frequent you think that expression is, in contrast to the other expressions presented on the same screen. We also show a sentence frame where each of the candidate expressions might occur in. Please ask yourself how frequently you would expect to hear each expression in that sentence frame. <br> Please use the whole range of slider values and please try to indicate also small differences between expressions, according to your intuition. <br> Notice that you can only advance to the next screen after you have clicked on or moved every slider.",
    // instuction's slide proceeding button text
    "buttonText": "Start experiment!",
    render: function() {

        viewTemplate = $("#instructions-view").html();
        $('#main').html(Mustache.render(viewTemplate, {
            title: this.title,
            text: this.text,
            button: this.buttonText
        }));

        // moves to the next view
        $('#next').on('click', function(e) {
            exp.findNextView();
        }); 

    },
    trials: 1
};

var mainSliderRating = {
    render : function(CT) {
        var view = {};
        view.name = 'trial',
        view.template = $('#trial-view-slider-response').html();
        view.response = $('#response').html();
        var response;
        $('#main').html(Mustache.render(view.template, {
            word1: exp.trial_info.main_trials[CT].words[0],
			word2: exp.trial_info.main_trials[CT].words[1],
			question: "How common (relative to each other) do you think these expressions are in a sentence frame like the one below?",
			sentence: exp.trial_info.main_trials[CT].sentence
        }));
		
		var words = _.shuffle(exp.trial_info.main_trials[CT].words);
		var responses = _.map(words, function(w) {return 0});
		
		onSliderChange = function(i ) {
			responses[i] = 1
			$('#'+words[i] + ' -webkit-slider-thumb').css('background', 'orange'); // why is this not working?
			if (_.sum(responses) == words.length) {
				$('#next').removeClass('nodisplay');
			}
		}
		
		//create table
		
		var outstring = "<table id='slidertable' align='center' width = '600px'>"
		outstring += '<tr><td></td><td width="420px"><div style="float:left;width:40%;">extremely rare</div><div style="float:right;width:40%;text-align:right">extremely common</div></td></tr>'
		for (var i = 0; i < words.length; i++) {
			outstring += '<tr height="35px"><td align="right" width="130px"><b>' + words[i] + '</b></td><td><input type="range" id="' + words[i] + '" class="slider-response" min="0" max="100"value="50"onchange="onSliderChange(' + i + ')"onclick="onSliderChange(' + i + ')"/></td></tr>'	
		}
	    outstring += '</table>'
		
		$('#tablecontainer').html(outstring);
	
        
		// update the progress bar based on how many trials there are in this round
        var filled = exp.currentTrialInViewCounter * (60 / exp.views_seq[exp.currentViewCounter].trials);
        $('#filled').css('width', filled);
	
		startingTime = Date.now();	

		
        $('#next').on('click', function() {
            RT = Date.now() - startingTime; // measure RT before anything else
            trial_data = {
                trial_type: "mainSliderRating",
                trial_number: CT+1,
                RT: RT
            };
			_.map(_.range(words.length),
				  function(i) {
					trial_data[words[i]] = $('#'+words[i]).val();
				  }
				 );
            exp.trial_data.push(trial_data);
            exp.findNextView();
        });

        return view;
    },
    trials: main_trials.length
};

var postTest = {
    name: 'postTest',
    "title": "Additional Info",
    "text": "Answering the following questions is optional, but will help us understand your answers.",
    "buttonText": "Continue",
    // render function renders the view
    render : function() {

        viewTemplate = $('#post-test-view').html();
        $('#main').html(Mustache.render(viewTemplate, {
            title: this.title,
            text: this.text,
            buttonText: this.buttonText
        }));

        $('#next').on('click', function(e) {
            // prevents the form from submitting
            e.preventDefault();

            // records the post test info
            exp.global_data.age = $('#age').val();
            exp.global_data.gender = $('#gender').val();
            exp.global_data.education = $('#education').val();
            exp.global_data.languages = $('#languages').val();
            exp.global_data.comments = $('#comments').val().trim();
            exp.global_data.endTime = Date.now();
            exp.global_data.timeSpent = (exp.global_data.endTime - exp.global_data.startTime) / 60000;

            // moves to the next view
            exp.findNextView();
        })

    },
    trials: 1
};

var thanks = {
    name: 'thanks',
    "message": "Thank you for taking part in this experiment!",
    render: function() {

        viewTemplate = $('#thanks-view').html();

        // what is seen on the screen depends on the used deploy method
		//    normally, you do not need to modify this
        if ((config_deploy.is_MTurk) || (config_deploy.deployMethod === 'directLink')) {
            // updates the fields in the hidden form with info for the MTurk's server
            $('#main').html(Mustache.render(viewTemplate, {
                thanksMessage: this.message,
            }));
        } else if (config_deploy.deployMethod === 'Prolific') {
            var prolificURL = 'https://prolific.ac/submissions/complete?cc=' + config_deploy.prolificCode;

            $('main').html(Mustache.render(viewTemplate, {
                thanksMessage: this.message,
                extraMessage: "Please press the button below<br />" + '<a href=' + prolificURL +  ' class="prolific-url">Finished!</a>'
            }));
        } else if (config_deploy.deployMethod === 'debug') {
            $('main').html(Mustache.render(viewTemplate, {}));
        } else {
            console.log('no such config_deploy.deployMethod');
        }

        exp.submit();

    },
    trials: 1
};