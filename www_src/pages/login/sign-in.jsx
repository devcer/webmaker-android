var React = require('react/addons');
var api = require('../../lib/api');
var FormInput = require('./form-input.jsx');

// <SignIn />
// Component for the Sign in user form. See Login view for usage.
var SignIn = React.createClass({

  mixins: [React.addons.LinkedStateMixin, require('../../lib/validators')],

  // Props:
  //   show
  //     boolean
  //     Shows the entire component if true, hides if false
  //   setParentState
  //     function(state)
  //     Calls setState on parent component (Login) given a state object.
  //     Useful for setting the loading or mode state of the Login view.
  //
  getDefaultProps: function () {
    return {};
  },

  // State:
  //   globalError
  //     string or boolean
  //     Indicates whether or not a an error was received from the server.
  //   username
  //   password
  //     string
  //     These store state for the form input fields
  getInitialState: function () {
    return {
      globalError: false
    };
  },

  fields: [
    {
      name: 'username',
      label: 'Username',
      required: true
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      helpText: <a href="#">Reset Password</a>
    }
  ],

  // Called when the form is submitted
  // Triggers an api call via api.authenticate
  // If an error is received, sets state.globalError
  // If success:
  //    1. resets form
  //    2. caches user session in Android
  //    3. redirects to /main
  onSubmit: function (e) {
    e.preventDefault();

    var errors = this.getValidationErrors();
    if (Object.keys(errors).length > 0) {
      return;
    }

    var json = {
      uid: this.state.username,
      password: this.state.password
    };

    this.props.setParentState({loading: true});
    api.authenticate({json}, (err, data) => {
      this.props.setParentState({loading: false});
      if (err) {
        this.setState({globalError: true});
        return;
      }

      this.replaceState(this.getInitialState());

      if (window.Android) {
        window.Android.setUserSession(JSON.stringify(data));
        window.Android.setView('/main');
      }
    });
  },

  // Changes parent mode (Login component) to show sign-up
  changeMode: function (e) {
    e.preventDefault();
    this.props.setParentState({mode: 'sign-up'});
  },

  render: function () {

    var errors = this.getValidationErrors();
    var isValid = Object.keys(errors).length === 0;

    return (<form hidden={!this.props.show} className="editor-options" onSubmit={this.onSubmit}>
      {this.fields.map(field => {
        return <FormInput {...field}
          errors={errors[field.name]}
          valueLink={this.linkState(field.name)} />;
      })}
      <div className="form-group">
        <button className="btn btn-block" disabled={!isValid} onClick={this.onSubmit}>
          Sign In
        </button>
        <div className="error" hidden={!this.state.globalError}>
          Looks like there might be a problem with your username or password.
        </div>
      </div>
      <div className="form-group text-center text-larger">
        Don&rsquo;t have an account? <a href="#" onClick={this.changeMode}>Join Webmaker</a>
      </div>
    </form>);
  }
});

module.exports = SignIn;
