# Machine Learning for Water Demand Forecasting

Project website for the Babu Banarasi Das University CSE team presentation, now expanded into a realistic water utility portal.

## Run the site

```bash
node server.js
```

Admin login credentials are configured through `ADMIN_USERNAME` and
`ADMIN_PASSWORD` environment variables. Do not commit these values.

Then visit:
- [http://localhost:8080](http://localhost:8080)
- [http://localhost:8080/dashboard.html](http://localhost:8080/dashboard.html)
- [http://localhost:8080/admin.html](http://localhost:8080/admin.html)
- [http://localhost:8080/report.html](http://localhost:8080/report.html)

## Included features

- Forecast demo and city comparison
- Interactive operations dashboard
- District-level map view
- Admin login mock with backend API
- Export-ready report page

The dashboard and overview use OpenStreetMap tiles and require an internet connection. Map markers are approximate illustrative planning locations, not verified utility assets or official service boundaries.

## Deploy to Render

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint** and connect the repository. Render reads `render.yaml`.
3. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in the service environment settings.
4. Deploy the service and open the generated `onrender.com` URL.

The admin view is a prototype and does not yet provide server-side sessions or authorization for protected data. Do not use it to protect sensitive information until proper authentication and session handling are implemented.

## Team

Anand, Gautami, Prachi, Sahil
# water-demand-forecasting
