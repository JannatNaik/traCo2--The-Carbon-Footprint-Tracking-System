<%@ page import="java.sql.*" %>
<%@ page import="javax.servlet.http.*" %>
<%@ page import="javax.servlet.*" %>
<%
    // Database credentials
    String jdbcURL = "jdbc:mysql://localhost:3306/carbon_footprint_tracker";
    String dbUser = "root";
    String dbPassword = "password";
    
    // Get user session
    HttpSession sessionUser = request.getSession(false);
    if (sessionUser == null || sessionUser.getAttribute("uid") == null) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    int uid = (int) sessionUser.getAttribute("uid");
    Connection conn = null;
    PreparedStatement pstmt = null;
    ResultSet rs = null;
    
    double emissions = 0.0;
    String vehicleType = "";
    String fuelType = "";
    double avgMileage = 0.0;
    
    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(jdbcURL, dbUser, dbPassword);
        
        // Fetch user fuel details from user_profile
        String query = "SELECT vehicle_type, fuel_type, average_mileage FROM user_profile WHERE uid = ?";
        pstmt = conn.prepareStatement(query);
        pstmt.setInt(1, uid);
        rs = pstmt.executeQuery();
        
        if (rs.next()) {
            vehicleType = rs.getString("vehicle_type");
            fuelType = rs.getString("fuel_type");
            avgMileage = rs.getDouble("average_mileage");
        }
        
        // Assume fuel emission factor (kg CO2 per liter of fuel)
        double emissionFactor = fuelType.equalsIgnoreCase("petrol") ? 2.31 : 
                                fuelType.equalsIgnoreCase("diesel") ? 2.68 : 2.00;
        
        // Get user input (fuel consumed in liters)
        double fuelConsumed = Double.parseDouble(request.getParameter("fuelConsumed"));
        
        // Calculate emissions
        emissions = fuelConsumed * emissionFactor;
        
        // Insert emission record into carbon_emissions table
        String insertQuery = "INSERT INTO carbon_emissions (uid, timestamp, emission_value, emission_unit, source_type) VALUES (?, NOW(), ?, 'kgCO2', 'Fuel Consumption')";
        pstmt = conn.prepareStatement(insertQuery);
        pstmt.setInt(1, uid);
        pstmt.setDouble(2, emissions);
        pstmt.executeUpdate();
        
    } catch (Exception e) {
        e.printStackTrace();
    } finally {
        if (rs != null) rs.close();
        if (pstmt != null) pstmt.close();
        if (conn != null) conn.close();
    }
%>
<html>
<head><title>Fuel Emission Calculator</title></head>
<body>
    <h2>Fuel Emission Calculation Result</h2>
    <p>Vehicle Type: <%= vehicleType %></p>
    <p>Fuel Type: <%= fuelType %></p>
    <p>Average Mileage: <%= avgMileage %> km/l</p>
    <p>Fuel Consumed: <%= request.getParameter("fuelConsumed") %> liters</p>
    <p>Carbon Emissions: <%= emissions %> kgCO2</p>
    <a href="dashboard.jsp">Back to Dashboard</a>
</body>
</html>
