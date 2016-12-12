# What URL should be used to access your application?

It can be accessed at the root url /.

# What libraries did you use to write your application?

I used Angular 1.x, as well as lodash and jQuery.

# What influenced the design of your user interface?

Because all of the API routes are public except for /login and /write, I decided to not require login for the state listing page or guest book. Logging in causes the user to be redirected back to the page they were previousely and allows them to submit guest book entries.
If those pages are meant to private, all API endpoints should have an authorization scheme.

I created a top nav bar for three main application functions: state listing, guest books, and authorization. Logging out will not change the current page but will hide the guest book form if it is showing.

The design is responsive and should not break across most screen widths including iPhone 5.

What I would like to improve if I spent more time on this:
1. Add indication in Nav of current route/feature
2. Add hover effects and animations using transitions
3. Make login modal instead of a seperate route
4. Add mobile hamburger menu
5. Use columns or grids to display more states and guest book entries on the screen.
6. On states listing, add ability to sort or filter based on available fields.
7. Add icons
8. Add validation to phone number field


# What steps did you take to make your application user friendly?

1. I thought adding a nav bar with all app functions would be the most ideal user interface for navigation.
2. The logout function doens't trigger a page change so the user doesn't get interrupted. 
3. The login page remembers the previous location and redirects to that location after succesful login. In the case of the login page being considered the last page, the user is taken to the states list.
4. The back button works correctly and all routes are navigatable from the URL bar.
5. When logging out on the guest book page, the form dissapears so users can't accidently submit the form after the session has been terminated.


# What steps did you take to insure your application was secure?

1. Login state is never held within the application. All models reference the cookie directly so the app should never get out of sync with the cookie.
2. The form view always references the cookie so it shouldn't show if there is no cookie present.
3. All guest phone number and data fields are sanitized. I sanitize them before sending to the server and also before displaying.

# What could be done to the front end or back end to make it more secure?

1. Use HTTPS.
2. Use token-based auth instead of cookie or session-based auth. 
3. Sanitize and escape all user input on the server side
4. Uglify/minify frontned script to make reverse engineering more difficult
5. Render templates on server side that contain only the views that are allowed to prevent reverse engineering.
