
  (function( $ ) {
  var defaults = {
    propertyName: "value",
    api_key: 'MAILGUN_PUBKEY',
  };
  
  function Mailgun(element, options) {
    this.element = element;
    this.options = $.extend(defaults, this.options);
    this.options.element = this.element.id;
    this.init();
  }
  
  Mailgun.prototype.init = function () {
    console.log("Element: "+ this.element.id);
    
    // Adding initialized stuff here w/in scope
  };
  
  $.fn.mailgun = function(options) {
    return this.each(function () {
      if(options && options.service === "validate") {
        $.fn.mailgun.validate(options.element, options);
      }
    });
  };
  
  $.fn.mailgun.validate = function(element, options){
    evaluate_properties(options);
    //var thisElement = $(this);
    options = check_callbacks(options);
    $.ajax({
      type: "GET",
      url: 'https://api.mailgun.net/v2/address/validate?callback=?',
      data: {address: options.email,
             api_key: options.api_key,
             mailbox_verification: options.mailbox_verification},
      dataType: "jsonp",
      crossDomain: true,
      success: function (data, status_text) {
        var response = marshal_from_response(data);
        console.log("Email: " + options.email + " => Validity: " + response);
        if (response) {
          if (options && options.success) {
            options.success_callback.fire(data, options.e);
          }
        }else {
          if (options && options.error) {
            options.error_callback.fire(data, options.e);
          }
        }
        
        if (options && options.complete){
          options.complete_callback.fire(data, options.e);
        }
        
      },
    })
    
  };
  
  function marshal_from_response(data){
    if(data.is_valid && (data.mailbox_verification === "true" || data.mailbox_verification === true)){
      return true;
    }else return !!(data.is_valid && (data.mailbox_verification === null || data.mailbox_verification === 'null'));
  }
  
  function evaluate_properties(options) {
    var required = {
      "validate": ["api_key", "email", "mailbox_verification"],
      "send": ["api_key", "from", "to", "subject", "text"]
    };
    if (options && options.service in required) {
      var requirements = required[options.service];
      $.each(requirements, function (index, requirement) {
        if (!options.hasOwnProperty(requirement)) {
          console.log("Error: Service " + options.service + " Missing requirement: " + requirement);
        }
      })
    }
  }
    
  function check_callbacks(options){
    var final_object = Object();
      if (options) {
        if (options.success) {
          var success_callback = $.Callbacks();
          success_callback.add(options.success);
          final_object = $.extend(options, {'success_callback': success_callback});
        }
        if (options.complete) {
          var complete_callback = $.Callbacks();
          complete_callback.add(options.complete);
          final_object = $.extend(options, {'complete_callback': complete_callback});
        }
        if (options.error) {
          var error_callback = $.Callbacks();
          error_callback.add(options.error);
          final_object = $.extend(options, {'error_callback': error_callback});
        }
        return final_object;
      }
  }
  })(jQuery);
