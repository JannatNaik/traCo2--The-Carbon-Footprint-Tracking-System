<%@ page import="java.sql.*" %>
<%@ page import="java.text.SimpleDateFormat" %>
<%@ page import="java.util.Date" %>
<%
    // Database connection details
    String dbURL = "jdbc:mysql://localhost:3306/carbon_footprint_tracker";
    String dbUser = "root"; // Change as per your setup
    String dbPass = "password"; // Change as per your setup
    Connection conn = null;
    PreparedStatement pstmt = null;
    ResultSet rs = null;
    
    // Get user ID from session or request (assumed session for now)
    Integer uid = (Integer) session.getAttribute("uid");
    if (uid == null) {
        out.println("<p>Please log in to calculate your travel emissions.</p>");
        return;
    }
    
    try {
        // Establish connection
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(dbURL, dbUser, dbPass);
        
        // Fetch user profile data
        String query = "SELECT vehicle_type, fuel_type, average_mileage FROM user_profile WHERE uid = ?";
        pstmt = conn.prepareStatement(query);
        pstmt.setInt(1, uid);
        rs = pstmt.executeQuery();
        
        if (rs.next()) {
            String vehicleType = rs.getString("vehicle_type");
            String fuelType = rs.getString("fuel_type");
            float mileage = rs.getFloat("average_mileage");
            
            // Example: Assume user provides travel distance
            float distance = Float.parseFloat(request.getParameter("distance"));
            
            // CO2 emission factors (kg CO2 per liter)
            float emissionFactor = 2.31f; // Example: Petrol
            if (fuelType.equalsIgnoreCase("diesel")) {
                emissionFactor = 2.68f;
            } else if (fuelType.equalsIgnoreCase("electric")) {
                emissionFactor = 0.0f;
            }
            
            // Calculate emissions
            float emissions = (distance / mileage) * emissionFactor;
            
            // Store the result in the database
            String insertQuery = "INSERT INTO carbon_emissions (uid, timestamp, emission_value, emission_unit, source_type) VALUES (?, ?, ?, ?, ?)";
            pstmt = conn.prepareStatement(insertQuery);
            pstmt.setInt(1, uid);
            pstmt.setTimestamp(2, new Timestamp(new Date().getTime()));
            pstmt.setFloat(3, emissions);
            pstmt.setString(4, "kg CO2");
            pstmt.setString(5, "transportation");
            pstmt.executeUpdate();
            
            out.println("<p>Estimated CO2 Emissions: " + emissions + " kg CO2</p>");
        } else {
            out.println("<p>User profile data not found. Please update your profile.</p>");
        }
    } catch (Exception e) {
        out.println("<p>Error: " + e.getMessage() + "</p>");
        e.printStackTrace();
    } finally {
        try { if (rs != null) rs.close(); if (pstmt != null) pstmt.close(); if (conn != null) conn.close(); } catch (Exception ignored) {}
    }
%>

<form method="POST">
    <label for="distance">Enter travel distance (km):</label>
    <input type="text" name="distance" required>
    <button type="submit">Calculate</button>
</form>
