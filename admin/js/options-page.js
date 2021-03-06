(function($, w){
    $(document).ready(function(){
        $('#diib_signup_submit').click(function(e){
            e.preventDefault();

            var $this = $(this);

            var payload = {
                email: $('#diib_signup_email').val(),
                full_name: $('#diib_signup_name').val(),
                password: {
                    first: $('#diib_signup_password').val(),
                    second: $('#diib_signup_repeat_password').val(),
                }
            };

            if (!$('#diib_signup_accept_terms').is(':checked')) {
                $('#diib-signup-errors p').html($('#diib_signup_accept_terms').data('notice'));
                $('#diib-signup-errors').show();
                return;
            }

            $this.prop('disabled', true);
            $('#diib-signup-errors p').html('');
            $('#diib-signup-errors').hide();
            $('#diib-signup-loading').show();

            $.ajax({
                dataType: 'json',
                data: payload,
                method: 'POST',
                url: $this.data('endpoint')
            }).done(function(json){
                console.log(json);
                $('#diib-signup-form').hide();
                $('#diib-signup-thank-you p.info').html($('#diib-signup-thank-you p.info').html().replace('%1$s', json.full_name).replace('%2$s', json.email));
                $('#diib-signup-thank-you').show();

                $('#diib_username').val(json.email);
                $('#diib_password').val(payload.password.first);
            }).fail(function(xhr){
                $('#diib-signup-errors p').html(xhr.responseJSON.errors.join('<br>'));
                $('#diib-signup-errors').show();
            }).always(function(){
                $this.prop('disabled', false);
                $('#diib-signup-loading').hide();
            });
        });

        $('#diib_authorize_user').click(function(e){
            e.preventDefault();

            var endpoint = $('#diib_authorize_user').data('endpoint'),
                clientId = $('#diib_authorize_user').data('clientId'),
                username = $('#diib_username').val(),
                password = $('#diib_password').val();

            if (username == '' || password == '') {
                return;
            }

            $('#diib_username').prop('readonly', true);
            $('#diib_password').prop('readonly', true);

            $('#diib_authorize_user').data('value', $('#diib_authorize_user').val());
            $('#diib_authorize_user').prop('disabled', true);
            $('#diib_authorize_user').val($('#diib_authorize_user').data('loading'));

            var payload = {
                grant_type: 'password',
                scope: 'account analytics',
                username: username,
                password: password,
                client_id: clientId
            };

            $.ajax({
                dataType: 'json',
                data: payload,
                method: 'POST',
                url: endpoint + '/token'
            }).done(function(json){
                var date = Math.round((new Date).getTime()/1000);

                $('#diib_access_token').val(json.access_token);
                $('#diib_refresh_token').val(json.refresh_token);
                $('#diib_access_token_expiration').val(date + json.expires_in);

                $('#diib_username').val('');
                $('#diib_password').val('');

                $('#diib-options-page-form input#submit').click();
            }).fail(function(xhr){
                alert(xhr.responseJSON.error_description);
            }).always(function(){
                $('#diib_username').prop('readonly', false);
                $('#diib_password').prop('readonly', false);
                $('#diib_authorize_user').prop('disabled', false);
                $('#diib_authorize_user').val($('#diib_authorize_user').data('value'));
            });
        });
    });
})(window.jQuery, window);