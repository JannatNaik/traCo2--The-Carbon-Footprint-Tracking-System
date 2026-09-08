<%@ page import="java.io.BufferedReader, java.io.InputStreamReader, java.io.OutputStreamWriter, java.net.HttpURLConnection, java.net.URL, org.json.JSONObject, java.sql.*" %>
<%
    String filePath = "C:/Users/sneh1/Downloads/sample_electricity_bill.pdf"; // Set the correct path
    String pythonScript = "C:/Users/sneh1/Downloads/pdf_parser.py"; // Set the correct script path
    String pythonCommand = "python " + pythonScript + " \"" + filePath + "\"";

    Process process = Runtime.getRuntime().exec(pythonCommand);
    BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

    StringBuilder jsonOutput = new StringBuilder();
    String line;
    while ((line = reader.readLine()) != null) {
        jsonOutput.append(line);
    }
    reader.close();

    // Parse JSON Response
    JSONObject json = new JSONObject(jsonOutput.toString());
    double electricityConsumed = json.getDouble("electricity_units");
    
    // Assume user selects electricity source
    String electricitySource = request.getParameter("electricity_source"); // coal, natural_gas, renewable
    double emissionFactor = 0.0;
    
    if ("coal".equals(electricitySource)) {
        emissionFactor = 0.8;
    } else if ("natural_gas".equals(electricitySource)) {
        emissionFactor = 0.4;
    } else if ("renewable".equals(electricitySource)) {
        emissionFactor = 0.1;
    }

    // Calculate Emission
    double emission = electricityConsumed * emissionFactor;

    // Database Connection
    String url = "jdbc:mysql://localhost:3306/carbon_footprint_tracker";
    String user = "root"; // Change if necessary
    String password = "yourpassword"; // Change to your MySQL password
    Connection conn = null;
    PreparedStatement pstmt = null;

    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(url, user, password);

        // Insert emission data into the 'carbon_emissions' table
        String sql = "INSERT INTO carbon_emissions (uid, timestamp, emission_value, emission_unit, source_type) VALUES (?, NOW(), ?, 'kWh', ?)";
        pstmt = conn.prepareStatement(sql);
        pstmt.setInt(1, 1); // Example user ID, modify accordingly
        pstmt.setDouble(2, emission);
        pstmt.setString(3, electricitySource);

        pstmt.executeUpdate();
    } catch (Exception e) {
        out.println("Database Error: " + e.getMessage());
    } finally {
        if (pstmt != null) pstmt.close();
        if (conn != null) conn.close();
    }
%>

<!DOCTYPE html>
<html>
<head>
    <title>Electricity Consumption</title>
</head>
<body>
    <h2>Electricity Consumption Report</h2>
    <p><strong>Electricity Consumed:</strong> <%= electricityConsumed %> kWh</p>
    <p><strong>Emission Factor:</strong> <%= emissionFactor %></p>
    <p><strong>Total Emission:</strong> <%= emission %> kg CO2</p>
</body>
</html>
