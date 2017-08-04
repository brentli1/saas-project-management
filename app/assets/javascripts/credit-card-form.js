function getURLParameter(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');

  for(var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if(sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}

$(function() {
  var show_error, stripeResponseHandler, submitHandler, handlePlanChange;
  var $ccForm = $('.cc_form');

  show_error = function (message) {
    if ($("#flash-messages").size() < 1) {
      $('div.container.main div:first').prepend("<div id='flash-messages'></div>")
    }

    $("#flash-messages").html('<div class="alert alert-warning"><a class="close" data-dismiss="alert">×</a><div id="flash_alert">' + message + '</div></div>');
    $('.alert').delay(5000).fadeOut(3000);

    return false;
  }

  stripeResponseHandler = function(status, response) {
    var token;
    if(response.error) {
      console.log(response.error.message);
      show_error(response.error.message);
      $ccForm.find('input[type=submit]').prop('disabled', false);
    } else {
      token = response.id;
      $ccForm.append($('<input type="hidden" name="payment[token]"/>').val(token));

      $('[data-stripe=number]').remove();
      $('[data-stripe=cvv]').remove();
      $('[data-stripe=exp-year]').remove();
      $('[data-stripe=exp-month]').remove();
      $('[data-stripe=label]').remove();

      $ccForm.get(0).submit();
    }

    return false;
  }

  submitHandler = function(evt) {
    $ccForm.find('input[type=submit]').prop('disabled', true);
    
    // Stripe code
    if(Stripe) {
      Stripe.card.createToken($ccForm, stripeResponseHandler);
    } else {
      show_error('Failed to load credit card processing functionality.  Please reload the page.');
    }

    return false;
  }

  handlePlanChange = function(planType, form) {
    var $form = $(form);

    if(planType == undefined) {
      planType = $('#tenant_plan :selected').val();
      handlePlanChange($form, planType);
    } else if(planType === 'premium') {
      $('[data-stripe]').prop('required', true);
      $form.off('submit');
      $form.on('submit', submitHandler);
      $('[data-stripe]').show();
    } else {
      $('[data-stripe]').hide();
      $('[data-stripe]').removeProp('required');
      $form.off('submit');
    }
  }

  // Set up listeners
  $('.cc_form').on("submit", submitHandler);
  $('#tenant_plan').on('change', function(evt) {
    handlePlanChange($('#tenant_plan :selected').val(), '.cc_form');
  });

  handlePlanChange(getURLParameter('plan'), '.cc_form');
});
