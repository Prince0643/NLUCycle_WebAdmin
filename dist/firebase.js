// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA8W0T2-SGnYOT9ALf7Qqf47TPUvNn87YQ",
  authDomain: "tricycle-flutter-app.firebaseapp.com",
  databaseURL: "https://tricycle-flutter-app-default-rtdb.firebaseio.com",
  projectId: "tricycle-flutter-app",
  storageBucket: "tricycle-flutter-app.appspot.com",
  messagingSenderId: "1070834755333",
  appId: "1:1070834755333:web:6f4b4e2f4f4f4f4f"
};

firebase.initializeApp(firebaseConfig);

// Get a reference to the database
const database = firebase.database();

// Get a reference to the rides node
const ridesRef = database.ref('rides');

// Initialize totals
let totalCompletedRides = 0;
let totalCancelledRides = 0;

// Retrieve the ride data
ridesRef.on('value', (data) => {
  const rides = data.val();
  console.log('Retrieved rides:', rides); // Debugging line

  const dailyRides = [];
  Object.keys(rides).forEach((userKey) => {
    Object.keys(rides[userKey]).forEach((rideKey) => {
      const ride = rides[userKey][rideKey];
      const bookingDate = new Date(ride.booking_date_time).toLocaleDateString(); // Format to only show the date
      const completionStatus = ride.completion_status;

      // Find or create an entry for the booking date
      let dateEntry = dailyRides.find(entry => entry.date === bookingDate);
      if (!dateEntry) {
        dateEntry = { date: bookingDate, completed: 0, cancelled: 0, waiting: 0 };
        dailyRides.push(dateEntry);
      }

      // Increment the appropriate count based on the completion status
      if (completionStatus === 'completed') {
        dateEntry.completed += 1;
        totalCompletedRides += 1; // Increment total completed rides
      } else if (completionStatus === 'failed' || completionStatus === 'cancelled') {
        dateEntry.cancelled += 1;
        totalCancelledRides += 1; // Increment total cancelled rides
      } else if (completionStatus === 'waiting') {
        dateEntry.waiting += 1;
      }
    });
  });

  // Sort dailyRides by date (oldest to most recent)
  dailyRides.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Update total rides cards
  document.getElementById('total-completed-rides').textContent = totalCompletedRides;
  document.getElementById('total-cancelled-rides').textContent = totalCancelledRides;

  // Create the chart after processing the data
  const ctx = document.getElementById('ridesChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dailyRides.map(ride => ride.date),
      datasets: [{
        label: 'Completed Rides',
        data: dailyRides.map(ride => ride.completed),
        borderColor: 'rgba(0, 128, 0, 0.5)',
        backgroundColor: 'rgba(0, 128, 0, 0.5)',
        fill: false,
      }, {
        label: 'Cancelled Rides',
        data: dailyRides.map(ride => ride.cancelled),
        borderColor: 'rgba(255, 0, 0, 0.5)',
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        fill: false,
      }, {
        label: 'Waiting Rides',
        data: dailyRides.map(ride => ride.waiting),
        borderColor: 'rgba(255, 255, 0, 0.5)',
        backgroundColor: 'rgba(255, 255, 0, 0.5)',
        fill: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        text: 'Rides Completed, Cancelled, and Waiting Over Time'
      },
      scales: {
        x: {
          type: 'category', // Use 'category' for simple date labels
          title: {
            display: true,
            text: 'Booking Date'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Rides'
          }
        }
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          boxWidth: 20,
          padding: 10,
          usePointStyle: false
        }
      }
    }
  });
});

ridesRef.on('value', (ridesSnapshot) => {
  const waitingRidesArray = [];

  // Loop through the users
  ridesSnapshot.forEach((userRides) => {
    // Loop through the rides for each user
    userRides.forEach((ride) => {
      const rideData = ride.val();
      // Check if the ride is waiting
      if (rideData.completion_status === 'waiting') {
        waitingRidesArray.push(rideData);
      }
    });
  });

  // Sort the waiting rides array by booking date and time in descending order
  waitingRidesArray.sort((a, b) => new Date(b.booking_date_time) - new Date(a.booking_date_time));

  // Populate the waiting rides table
  const waitingRidesTableBody = document.getElementById('waiting-rides-table-body');
  waitingRidesTableBody.innerHTML = '';
  waitingRidesArray.forEach((ride) => {
    const rideElement = document.createElement('tr');
    const bookingDateTime = new Date(ride.booking_date_time).toLocaleString(); // Format date and time
    rideElement.innerHTML = `
      <td>${ride.origin}</td>
      <td>${ride.destination}</td>
      <td>${ride.distance}</td>
      <td>${ride.fare}</td>
      <td>${ride.completion_status}</td>
      <td>${bookingDateTime}</td>
    `;
    waitingRidesTableBody.appendChild(rideElement);
  });
});

ridesRef.on('value', (ridesSnapshot) => {
  const waitingRidesArray = [];

  // Loop through the users
  ridesSnapshot.forEach((userRides) => {
    // Loop through the rides for each user
    userRides.forEach((ride) => {
      const rideData = ride.val();
      // Check if the ride is completed
      if (rideData.completion_status === 'completed') {
        waitingRidesArray.push(rideData);
      }
    });
  });

  // Sort the waiting rides array by booking date and time in descending order
  waitingRidesArray.sort((a, b) => new Date(b.booking_date_time) - new Date(a.booking_date_time));

  // Populate the waiting rides table
  const waitingRidesTableBody = document.getElementById('completed-rides-table-body');
  waitingRidesTableBody.innerHTML = '';
  waitingRidesArray.forEach((ride) => {
    const rideElement = document.createElement('tr');
    const bookingDateTime = new Date(ride.booking_date_time).toLocaleString();
    const completedDateTime = new Date(ride.completion_date).toLocaleString();

    rideElement.innerHTML = `
      <td>${ride.origin}</td>
      <td>${ride.destination}</td>
      <td>${ride.distance}</td>
      <td>${ride.fare}</td>
      <td>${ride.completion_status}</td>
      <td>${bookingDateTime}</td>
      <td>${completedDateTime}</td>
    `;
    waitingRidesTableBody.appendChild(rideElement);
  });
});

ridesRef.on('value', (ridesSnapshot) => {
  const waitingRidesArray = [];

  // Loop through the users
  ridesSnapshot.forEach((userRides) => {
    // Loop through the rides for each user
    userRides.forEach((ride) => {
      const rideData = ride.val();
      // Check if the ride is completed
      if (rideData.completion_status === 'cancelled') {
        waitingRidesArray.push(rideData);
      }
    });
  });

  // Sort the waiting rides array by booking date and time in descending order
  waitingRidesArray.sort((a, b) => new Date(b.booking_date_time) - new Date(a.booking_date_time));

  // Populate the waiting rides table
  const waitingRidesTableBody = document.getElementById('cancelled-rides-table-body');
  waitingRidesTableBody.innerHTML = '';
  waitingRidesArray.forEach((ride) => {
    const rideElement = document.createElement('tr');
    const bookingDateTime = new Date(ride.booking_date_time).toLocaleString(); // Format date and time
    rideElement.innerHTML = `
      <td>${ride.origin}</td>
      <td>${ride.destination}</td>
      <td>${ride.distance}</td>
      <td>${ride.fare}</td>
      <td>${ride.completion_status}</td>
      <td>${bookingDateTime}</td> <!-- Include date and time -->
    `;
    waitingRidesTableBody.appendChild(rideElement);
  });
});

ridesRef.on('value', (ridesSnapshot) => {
  const waitingRidesArray = [];

  // Loop through the users
  ridesSnapshot.forEach((userRides) => {
    // Loop through the rides for each user
    userRides.forEach((ride) => {
      const rideData = ride.val();
      // Check if the ride is completed
      if (rideData.completion_status === 'failed') {
        waitingRidesArray.push(rideData);
      }
    });
  });

  // Sort the waiting rides array by booking date and time in descending order
  waitingRidesArray.sort((a, b) => new Date(b.booking_date_time) - new Date(a.booking_date_time));

  // Populate the waiting rides table
  const waitingRidesTableBody = document.getElementById('failed-rides-table-body');
  waitingRidesTableBody.innerHTML = '';
  waitingRidesArray.forEach((ride) => {
    const rideElement = document.createElement('tr');
    const bookingDateTime = new Date(ride.booking_date_time).toLocaleString();
    const completedDateTime = new Date(ride.completion_date).toLocaleString();

    rideElement.innerHTML = `
      <td>${ride.origin}</td>
      <td>${ride.destination}</td>
      <td>${ride.distance}</td>
      <td>${ride.fare}</td>
      <td>${ride.completion_status}</td>
      <td>${bookingDateTime}</td> <!-- Include date and time -->
      <td>${completedDateTime}</td>

    `;
    waitingRidesTableBody.appendChild(rideElement);
  });
});

function searchTable(tableType) {
  let input, filter, table, tbody, tr, td, i, j, txtValue;
  if (tableType === 'waiting') {
    input = document.getElementById('search-waiting');
    table = document.getElementById('waiting-rides-table');
  } else if (tableType === 'completed') {
    input = document.getElementById('search-completed');
    table = document.getElementById('completed-rides-table');
  } else if (tableType === 'cancelled') {
    input = document.getElementById('search-cancelled');
    table = document.getElementById('cancelled-rides-table');
  } else if (tableType === 'failed') {
    input = document.getElementById('search-failed');
    table = document.getElementById('failed-rides-table');
  }

  filter = input.value.toLowerCase();
  tbody = table.getElementsByTagName("tbody")[0];
  tr = tbody.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    tr[i].style.display = "none"; // Hide all rows
    const tds = tr[i].getElementsByTagName("td");
    for (j = 0; j < tds.length; j++) {
      if (tds[j]) {
        txtValue = tds[j].textContent || tds[j].innerText;
        if (txtValue.toLowerCase().indexOf(filter) > -1) {
          tr[i].style.display = ""; // Show the row if it matches
          break; // No need to check other cells in this row
        }
      }
    }
  }
}

// Get a reference to the logs node
const logsRef = database.ref('logs');

// Use the once() method to read the data from the logs node
logsRef.limitToLast(10).once('value', (logsSnapshot) => {
  console.log('Logs data:', logsSnapshot.val());

  const logsTableBody = document.getElementById('logs-tbody');
  logsTableBody.innerHTML = '';

  if (logsSnapshot.exists()) {
    // Loop through the logs and store them in an array
    const logsArray = [];
    logsSnapshot.forEach((log) => {
      logsArray.push(log.val());
    });

    // Reverse the order of the logs array
    logsArray.reverse();

    // Loop through the reversed logs array
    logsArray.forEach((logData) => {
      const logElement = document.createElement('tr');
      logElement.innerHTML = `
        <td>${logData.date}</td>
        <td>${logData.event}</td>
        <td>${logData.details}</td>
      `;
      logsTableBody.appendChild(logElement);
    });
  } else {
    // Handle the case where the logs node is empty
    const noLogsMessage = document.createElement('p');
    noLogsMessage.textContent = 'No logs available.';
    logsTableBody.appendChild(noLogsMessage);
  }
});

const usersRef = database.ref('users');
const driversRef = database.ref('drivers');
const ratingsRef = database.ref('ratings');

// Calculate and display top drivers and passengers
ratingsRef.on('value', (ratingsSnapshot) => {
  const driverRatings = {};
  const passengerRatings = {};

  // Loop through the ratings to calculate totals
  ratingsSnapshot.forEach((ratingSnapshot) => {
    const ratingData = ratingSnapshot.val();

    // Calculate for drivers
    if (ratingData.from_driver) {
      const driver = ratingData.from_driver;
      if (!driverRatings[driver]) {
        driverRatings[driver] = { totalRating: 0, count: 0 };
      }
      driverRatings[driver].totalRating += ratingData.rating;
      driverRatings[driver].count += 1;
    }

    // Calculate for passengers
    if (ratingData.from_passenger) {
      const passenger = ratingData.from_passenger;
      if (!passengerRatings[passenger]) {
        passengerRatings[passenger] = { totalRating: 0, count: 0 };
      }
      passengerRatings[passenger].totalRating += ratingData.rating;
      passengerRatings[passenger].count += 1;
    }
  });

  // Calculate average ratings for drivers
  const topDrivers = Object.keys(driverRatings).map(driver => ({
    name: driver,
    averageRating: (driverRatings[driver].totalRating / driverRatings[driver].count).toFixed(2),
    count: driverRatings[driver].count
  })).sort((a, b) => b.averageRating - a.averageRating).slice(0, 5);

  // Populate Top Drivers table
  const topDriversTableBody = document.getElementById('top-drivers-table-body');
  topDriversTableBody.innerHTML = '';
  topDrivers.forEach(driver => {
    const driverRow = document.createElement('tr');
    driverRow.innerHTML = `
      <td>${driver.name}</td>
      <td>${driver.averageRating}</td>
    `;
    topDriversTableBody.appendChild(driverRow);
  });

  // Calculate average ratings for passengers
  const topPassengers = Object.keys(passengerRatings).map(passenger => ({
    name: passenger,
    averageRating: (passengerRatings[passenger].totalRating / passengerRatings[passenger].count).toFixed(2),
    count: passengerRatings[passenger].count
  })).sort((a, b) => b.averageRating - a.averageRating).slice(0, 5);

  // Populate Top Passengers table
  const topPassengersTableBody = document.getElementById('top-passengers-table-body');
  topPassengersTableBody.innerHTML = '';
  topPassengers.forEach(passenger => {
    const passengerRow = document.createElement('tr');
    passengerRow.innerHTML = `
      <td>${passenger.name}</td>
      <td>${passenger.averageRating}</td>
    `;
    topPassengersTableBody.appendChild(passengerRow);
  });
});

let usersCount = 0;
let driversCount = 0;

// Use the once() method to read the data from the nodes
usersRef.once('value', (usersSnapshot) => {
  usersCount = usersSnapshot.numChildren();
  console.log('Number of users:', usersCount);

  // Update the HTML element with the count
  document.getElementById('user-count').textContent = `${usersCount}`;
});

driversRef.once('value', (driversSnapshot) => {
  driversCount = driversSnapshot.numChildren();
  console.log('Number of drivers:', driversCount);

  // Update the HTML element with the count
  document.getElementById('driver-count').textContent = `${driversCount}`;

  // To get the overall count, you can add the two counts together
  const overallCount = usersCount + driversCount;

  // Update the HTML element with the overall count
  document.getElementById('total-app-users').textContent = `${overallCount}`;
});

usersRef.orderByChild('signupTimestamp').on('value', (usersSnapshot) => {
  const userTableBody = document.getElementById('user-table-pending-body');
  userTableBody.innerHTML = '';

  // Create an array to hold users with blockedStatus "Pending"
  const usersArray = [];

  // Loop through the users and push only those with blockedStatus "Pending" into the array
  usersSnapshot.forEach((user) => {
    const userData = user.val();
    if (userData.blockedStatus === 'Pending') {
      usersArray.push({ key: user.key, data: userData });
    }
  });

  // Sort the users array in descending order based on signupTimestamp
  usersArray.sort((a, b) => new Date(b.data.signupTimestamp) - new Date(a.data.signupTimestamp));

  // Loop through the sorted array and populate the table
  usersArray.forEach((user) => {
    const userElement = document.createElement('tr');
    const signupDate = new Date(user.data.signupTimestamp);
    const formattedDate = `${signupDate.toLocaleDateString()} ${signupDate.toLocaleTimeString()}`;
    userElement.innerHTML = `
      <td>${formattedDate}</td>
      <td>${user.data.name}</td>
      <td>${user.data.email}</td>
      <td>${user.data.phone}</td>
      <td>
        <select id="blocked-status-${user.key}" onchange="updateBlockedStatus('${user.key}')">
          <option value="Pending" ${user.data.blockedStatus === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Approved" ${user.data.blockedStatus === 'Approved' ? 'selected' : ''}>Approved</option>
          <option value="Disapproved" ${user.data.blockedStatus === 'Disapproved' ? 'selected' : ''}>Disapproved</option>
        </select>
      </td>
      <td>
        <button class="btn btn-primary view-btn" style="color: #FFFFFF" onclick="viewUserDetails('${user.key}')">View</button>
      </td>
    `;
    userTableBody.appendChild(userElement);
  });
});


usersRef.orderByChild('signupTimestamp').on('value', (usersSnapshot) => {
  const userTableBody = document.getElementById('user-table-approved-body');
  userTableBody.innerHTML = '';

  // Create an array to hold users with blockedStatus "Pending"
  const usersArray = [];

  // Loop through the users and push only those with blockedStatus "Pending" into the array
  usersSnapshot.forEach((user) => {
    const userData = user.val();
    if (userData.blockedStatus === 'Approved') {
      usersArray.push({ key: user.key, data: userData });
    }
  });

  // Sort the users array in descending order based on signupTimestamp
  usersArray.sort((a, b) => new Date(b.data.signupTimestamp) - new Date(a.data.signupTimestamp));

  // Loop through the sorted array and populate the table
  usersArray.forEach((user) => {
    const userElement = document.createElement('tr');
    const signupDate = new Date(user.data.signupTimestamp);
    const formattedDate = `${signupDate.toLocaleDateString()} ${signupDate.toLocaleTimeString()}`;
    userElement.innerHTML = `
      <td>${formattedDate}</td>
      <td>${user.data.name}</td>
      <td>${user.data.email}</td>
      <td>${user.data.phone}</td>
      <td>
        <select id="blocked-status-${user.key}" onchange="updateBlockedStatus('${user.key}')">
          <option value="Pending" ${user.data.blockedStatus === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Approved" ${user.data.blockedStatus === 'Approved' ? 'selected' : ''}>Approved</option>
          <option value="Disapproved" ${user.data.blockedStatus === 'Disapproved' ? 'selected' : ''}>Disapproved</option>
        </select>
      </td>
      <td>
        <button class="btn btn-primary view-btn" style="color: #FFFFFF" onclick="viewUserDetails('${user.key}')">View</button>
      </td>
      <td>
        <button class="btn btn-primary" style="color: #FFFFFF" onclick="sendEmail('${user.key}')">Send Email</button>
      </td>
    `;
    userTableBody.appendChild(userElement);
  });
});

function sendEmail(userId) {
  // Get a reference to the user in the database
  const userRef = database.ref(`users/${userId}`);

  // Fetch the user's email from the database
  userRef.once('value')
    .then((snapshot) => {
      const userData = snapshot.val();
      console.log('Fetched user data:', userData); // For debugging purposes

      if (userData && userData.email) {
        const userEmail = userData.email;
        console.log('User  email:', userEmail); // For debugging purposes

        const emailData = {
          to: userEmail,
          subject: "Registration Approved. From NLUCycle",
          text: "Congratulations! Your registration for NLUCycle has been approved. You can now use our App."
        };

        fetch('http://localhost:3000/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.text();
          })
          .then(data => {
            console.log('Email sent successfully!', data);
            alert('Email sent successfully to ' + userEmail);
          })
          .catch(error => {
            console.error('Failed to send email:', error);
            alert('Failed to send email: ' + error.message);
          });
      } else {
        console.error('User  data not found or email is missing.');
        alert('User  data not found or email is missing.');
      }
    })
    .catch((error) => {
      console.error('Error fetching user data:', error);
      alert('Error fetching user data: ' + error.message);
    });
}

usersRef.orderByChild('signupTimestamp').on('value', (usersSnapshot) => {
  const userTableBody = document.getElementById('user-table-disapproved-body');
  userTableBody.innerHTML = '';

  // Create an array to hold users with blockedStatus "Disapproved"
  const usersArray = [];

  // Loop through the users and push only those with blockedStatus "Disapproved" into the array
  usersSnapshot.forEach((user) => {
    const userData = user.val();
    if (userData.blockedStatus === 'Disapproved') {
      usersArray.push({ key: user.key, data: userData });
    }
  });

  // Sort the users array in descending order based on signupTimestamp
  usersArray.sort((a, b) => new Date(b.data.signupTimestamp) - new Date(a.data.signupTimestamp));

  // Loop through the sorted array and populate the table
  usersArray.forEach((user) => {
    const userElement = document.createElement('tr');
    const signupDate = new Date(user.data.signupTimestamp);
    const formattedDate = `${signupDate.toLocaleDateString()} ${signupDate.toLocaleTimeString()}`;

    // Create a dropdown for reasons
    const reasons = ['Incomplete Documents', 'Fraudulent Information', 'Other'];
    const reasonOptions = reasons.map(reason => `<option value="${reason}" ${user.data.disapprovalReason === reason ? 'selected' : ''}>${reason}</option>`).join('');

    userElement.innerHTML = `
      <td>${formattedDate}</td>
      <td>${user.data.name}</td>
      <td>${user.data.email}</td>
      <td>${user.data.phone}</td>
      <td>
        <select id="blocked-status-${user.key}" onchange="updateBlockedStatus('${user.key}')">
          <option value="Pending" ${user.data.blockedStatus === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Approved" ${user.data.blockedStatus === 'Approved' ? 'selected' : ''}>Approved</option>
          <option value="Disapproved" ${user.data.blockedStatus === 'Disapproved' ? 'selected' : ''}>Disapproved</option>
        </select>
      </td>
      <td>
        <select id="disapproval-reason-${user.key}" onchange="updateDisapprovalReason('${user.key}')">
          ${reasonOptions}
        </select>
      </td>
      <td>
        <button class="btn btn-primary view-btn" style="color: #FFFFFF" onclick="viewUser Details('${user.key}')">View</button>
      </td>
    `;
    userTableBody.appendChild(userElement);
  });
});

function searchUsers(tableType) {
  let input, filter, table, tbody, tr, td, i, j, txtValue;
  if (tableType === 'pending') {
    input = document.getElementById('search-pending');
    table = document.getElementById('user-table-pending');
  } else if (tableType === 'approved') {
    input = document.getElementById('search-approved');
    table = document.getElementById('user-table-approved');
  } else if (tableType === 'disapproved') {
    input = document.getElementById('search-disapproved');
    table = document.getElementById('user-table-disapproved');
  }

  filter = input.value.toLowerCase();
  tbody = table.getElementsByTagName("tbody")[0];
  tr = tbody.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    tr[i].style.display = "none"; // Hide all rows
    const tds = tr[i].getElementsByTagName("td");
    for (j = 0; j < tds.length; j++) {
      if (tds[j]) {
        txtValue = tds[j].textContent || tds[j].innerText;
        if (txtValue.toLowerCase().indexOf(filter) > -1) {
          tr[i].style.display = ""; // Show the row if it matches
          break; // No need to check other cells in this row
        }
      }
    }
  }
}

function updateDisapprovalReason(uid) {
  const disapprovalReason = document.getElementById(`disapproval-reason-${uid}`).value;
  const userRef = database.ref(`users/${uid}`);

  userRef.update({
    disapprovalReason: disapprovalReason,
    disapprovalMessage: disapprovalReason === 'Incomplete Documents'
      ? 'Your documents are incomplete for registration. Please review them.'
      : disapprovalReason === 'Fraudulent Information'
        ? 'The information you provided may be false (e.g., full name, phone number, IDs). Please check again.'
        : '' // You can add more conditions for other reasons if needed
  })
    .then(() => {
      console.log('Disapproval reason updated successfully!');
    })
    .catch((error) => {
      console.error('Error updating disapproval reason:', error);
    });
}

function viewUserDetails(uid) {
  // Remove any existing dialog
  const existingDialog = document.querySelector('.dialog');
  if (existingDialog) {
    existingDialog.remove();
  }

  // Viewing users
  const userRef = database.ref(`users/${uid}`);
  userRef.once('value', (userSnapshot) => {
    const userData = userSnapshot.val();
    const dialog = document.createElement('div');
    dialog.innerHTML = `
      <div class="dialog-content">
        <h2 style="font-size: 24px;">User  Details</h2>
        <div class="image-container">
          <img src="${userData.idFrontImageUrl}" alt="User  Image" style="width: 250px; height: 350px; border-radius: 10px; margin-right: 10px;">
          <img src="${userData.idBackImageUrl}" alt="User  Image" style="width: 250px; height: 350px; border-radius: 10px; margin-right: 10px;">
          <img src="${userData.selfieImageUrl}" alt="User  Image" style="width: 250px; height: 350px; border-radius: 10px;">
        </div>
        <p style="font-size: 18px;">Name: ${userData.name}</p>
        <p style="font-size: 18px;">Email: ${userData.email}</p>
        <p style="font-size: 18px;">Phone: ${userData.phone}</p>
        <button class="close-btn" style="background-color: #ed850e; color: #FFFFFF; border: none; border-radius: 5px; padding: 10px 20px; cursor: pointer; position: absolute; bottom: 10px; left: 10px;" onclick="closeDialog()">Close</button>
      </div>
    `;
    dialog.className = 'dialog';

    // Add styles for the dialog
    const style = document.createElement('style');
    style.innerHTML = `
      .dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        max-width: 95%; /* Increase the max-width to make the dialog wider */
        width: 900px; /* Set a specific width for the dialog */
        max-height: 80%;
        overflow: hidden; /* Prevent overflow of the dialog itself */
        padding: 10px; /* Add padding to the dialog */
      }
      .dialog-content {
        padding: 20px; /* Space between content and dialog */
        max-height: 70vh; /* Set a max height for the content */
        overflow-y: auto; /* Enable vertical scrolling only for content */
      }
      .image-container {
        display: flex; /* Use flexbox to arrange images in a row */
        justify-content: space-between; /* Optional: space between images */
        margin-bottom: 10px; /* Space below the image container */
      }
      .image-container img {
        border-radius: 10px; /* Ensure images have rounded corners */
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(dialog);
  });
}

function updateBlockedStatus(uid) {
  const blockedStatus = document.getElementById(`blocked-status-${uid}`).value;

  // Show confirmation dialog
  const confirmationMessage = `Are you sure you want to change the status to "${blockedStatus}"?`;
  if (confirm(confirmationMessage)) {
    const userRef = database.ref(`users/${uid}`);
    userRef.update({ blockedStatus: blockedStatus })
      .then(() => {
        alert('Status updated successfully!');
      })
      .catch((error) => {
        console.error('Error updating status:', error);
        alert('Error updating status: ' + error.message);
      });
  } else {
    // If the user cancels, revert the dropdown to the previous value
    const previousStatus = blockedStatus === 'Approved' ? 'Pending' : 'Disapproved';
    document.getElementById(`blocked-status-${uid}`).value = previousStatus;
  }
}

driversRef.orderByChild('signupTimestamp').on('value', (driversSnapshot) => {
  // Clear existing table bodies
  const driverTablePendingBody = document.getElementById('driver-table-pending-body');
  const driverTableApprovedBody = document.getElementById('driver-table-approved-body');

  driverTablePendingBody.innerHTML = '';
  driverTableApprovedBody.innerHTML = '';

  // Create arrays to hold drivers based on their status
  const pendingDrivers = [];
  const approvedDrivers = [];

  // Loop through the drivers and categorize them based on blockedStatus
  driversSnapshot.forEach((driver) => {
    const driverData = driver.val();
    const driverInfo = { key: driver.key, data: driverData };

    // Categorize drivers based on their blockedStatus
    if (driverData.blockedStatus === 'Pending') {
      pendingDrivers.push(driverInfo);
    } else if (driverData.blockedStatus === 'Approved') {
      approvedDrivers.push(driverInfo);
    }
  });

  // Function to populate a table with driver data
  const populateTable = (tableBody, driversArray, showEmailButton) => {
    // Sort the drivers array in descending order based on signupTimestamp
    driversArray.sort((a, b) => new Date(b.data.signupTimestamp) - new Date(a.data.signupTimestamp));

    // Loop through the sorted array and populate the table
    driversArray.forEach((driver) => {
      const driverElement = document.createElement('tr');
      const signupDate = new Date(driver.data.signupTimestamp);
      const formattedDate = `${signupDate.toLocaleDateString()} ${signupDate.toLocaleTimeString()}`;
      driverElement.innerHTML = `
        <td>${formattedDate}</td>
        <td>${driver.data.name}</td>
        <td>${driver.data.email}</td>
        <td>${driver.data.phone}</td>
        <td>${driver.data.plate}</td>
        <td>
          <select id="blocked-status-${driver.key}" onchange="updateBlockedStatusDriver('${driver.key}')">
            <option value="Pending" ${driver.data.blockedStatus === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Approved" ${driver.data.blockedStatus === 'Approved' ? 'selected' : ''}>Approved</option>
            <option value="Disapproved" ${driver.data.blockedStatus === 'Disapproved' ? 'selected' : ''}>Disapproved</option>
          </select>
        </td>
        <td>
          <button class="btn btn-primary view-btn" style="color: #FFFFFF" onclick="viewDriverDetails('${driver.key}')">View</button>
        </td>
      `;

      // Add the Send Email button only for approved drivers
      if (showEmailButton) {
        driverElement.innerHTML += `
          <td>
            <button class="btn btn-primary" style="color: #FFFFFF" onclick="sendEmail('${driver.key}')">Send Email</button>
          </td>
        `;
      }

      tableBody.appendChild(driverElement);
    });
  };

  // Populate each table with the corresponding drivers
  populateTable(driverTablePendingBody, pendingDrivers, false); // No email button for pending drivers
  populateTable(driverTableApprovedBody, approvedDrivers, true); // Email button for approved drivers
});

function sendEmail(driverId) {
  // Get a reference to the driver in the database
  const driverRef = database.ref(`drivers/${driverId}`);

  // Fetch the driver's email from the database
  driverRef.once('value')
    .then((snapshot) => {
      const driverData = snapshot.val();
      console.log('Fetched driver data:', driverData); // Debugging line

      if (driverData && driverData.email) {
        const driverEmail = driverData.email; // Fetch the email
        console.log('Driver email:', driverEmail); // Debugging line

        const emailData = {
          to: driverEmail,
          subject: "Welcome to NLUCycle",
          text: "Dear Driver, welcome to NLUCycle! Your account has been approved."
        };

        // Send the email using your Node.js server
        fetch('http://localhost:3000/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.text();
          })
          .then(data => {
            console.log('Email sent successfully!', data);
            alert('Email sent successfully to ' + driverEmail);
          })
          .catch(error => {
            console.error('Failed to send email:', error);
            alert('Failed to send email: ' + error.message);
          });
      } else {
        console.error('Driver data not found or email is missing.');
        alert('Driver data not found or email is missing.');
      }
    })
    .catch((error) => {
      console.error('Error fetching driver data:', error);
      alert('Error fetching driver data: ' + error.message);
    });
}

driversRef.orderByChild('signupTimestamp').on('value', (driversSnapshot) => {
  const driverTableDisapprovedBody = document.getElementById('driver-table-disapproved-body');
  driverTableDisapprovedBody.innerHTML = '';

  const driversArray = [];

  // Loop through the drivers and push only those with blockedStatus "Disapproved" into the array
  driversSnapshot.forEach((driver) => {
    const driverData = driver.val();
    if (driverData.blockedStatus === 'Disapproved') {
      driversArray.push({ key: driver.key, data: driverData });
    }
  });

  // Sort the drivers array in descending order based on signupTimestamp
  driversArray.sort((a, b) => new Date(b.data.signupTimestamp) - new Date(a.data.signupTimestamp));

  // Loop through the sorted array and populate the table
  driversArray.forEach((driver) => {
    const driverElement = document.createElement('tr');
    const signupDate = new Date(driver.data.signupTimestamp);
    const formattedDate = `${signupDate.toLocaleDateString()} ${signupDate.toLocaleTimeString()}`;

    // Create a dropdown for reasons
    const reasons = ['Incomplete Documents', 'Fraudulent Information', 'Other'];
    const reasonOptions = reasons.map(reason => `<option value="${reason}" ${driver.data.disapprovalReason === reason ? 'selected' : ''}>${reason}</option>`).join('');

    driverElement.innerHTML = `
      <td>${formattedDate}</td>
      <td>${driver.data.name}</td>
      <td>${driver.data.email}</td>
      <td>${driver.data.phone}</td>
      <td>${driver.data.plate}</td>
      <td>
        <select id="blocked-status-${driver.key}" onchange="updateBlockedStatusDriver('${driver.key}')">
          <option value="Pending" ${driver.data.blockedStatus === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Approved" ${driver.data.blockedStatus === 'Approved' ? 'selected' : ''}>Approved</option>
          <option value="Disapproved" ${driver.data.blockedStatus === 'Disapproved' ? 'selected' : ''}>Disapproved</option>
        </select>
      </td>
      <td>
        <select id="disapproval-reason-${driver.key}" onchange="updateDisapprovalReasonDriver('${driver.key}')">
          ${reasonOptions}
        </select>
      </td>
      <td>
        <button class="btn btn-primary view-btn" style="color: #FFFFFF" onclick ="viewDriverDetails('${driver.key}')">View</button>
      </td>
    `;
    driverTableDisapprovedBody.appendChild(driverElement);
  });
});

function searchDrivers(tableType) {
  let input, filter, table, tbody, tr, td, i, j, txtValue;
  if (tableType === 'pending') {
    input = document.getElementById('search-pending-drivers');
    table = document.getElementById('driver-table-pending');
  } else if (tableType === 'approved') {
    input = document.getElementById('search-approved-drivers');
    table = document.getElementById('driver-table-approved');
  } else if (tableType === 'disapproved') {
    input = document.getElementById('search-disapproved-drivers');
    table = document.getElementById('driver-table-disapproved');
  }

  filter = input.value.toLowerCase();
  tbody = table.getElementsByTagName("tbody")[0];
  tr = tbody.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    tr[i].style.display = "none";
    const tds = tr[i].getElementsByTagName("td");
    for (j = 0; j < tds.length; j++) {
      if (tds[j]) {
        txtValue = tds[j].textContent || tds[j].innerText;
        if (txtValue.toLowerCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
          break;
        }
      }
    }
  }
}

function updateDisapprovalReasonDriver(uid) {
  const disapprovalReason = document.getElementById(`disapproval-reason-${uid}`).value;
  const userRef = database.ref(`drivers/${uid}`);

  userRef.update({
    disapprovalReason: disapprovalReason,
    disapprovalMessage: disapprovalReason === 'Incomplete Documents'
      ? 'Your documents are incomplete for registration. Please review them.'
      : disapprovalReason === 'Fraudulent Information'
        ? 'The information you provided may be false (e.g., full name, phone number, IDs). Please check again.'
        : ''
  })
    .then(() => {
      console.log('Disapproval reason updated successfully!');
    })
    .catch((error) => {
      console.error('Error updating disapproval reason:', error);
    });
}

function viewDriverDetails(uid) {
  const existingDialog = document.querySelector('.dialog');
  if (existingDialog) {
    existingDialog.remove();
  }

  const driverRef = database.ref(`drivers/${uid}`);
  driverRef.once('value', (driverSnapshot) => {
    const driverData = driverSnapshot.val();
    const dialog = document.createElement('div');
    dialog.innerHTML = `
      <div class="dialog-content">
        <h2 style="font-size: 24px;">Driver Details</h2>
        <div class="image-container">
          <img src="${driverData.idFrontImageUrl}" alt="Driver ID Front Image" style="width: 250px; height: 350px; border-radius: 10px; margin-right: 10px;">
          <img src="${driverData.idBackImageUrl}" alt="Driver ID Back Image" style="width: 250px; height: 350px; border-radius: 10px; margin-right: 10px;">
          <img src="${driverData.selfieImageUrl}" alt="Driver Selfie Image" style="width: 250px; height: 350px;">
        </div>
        <p style="font-size: 18px;">Name: ${driverData.name}</p>
        <p style="font-size: 18px;">Email: ${driverData.email}</p>
        <p style="font-size: 18px;">Phone: ${driverData.phone}</p>
        <p style="font-size: 18px;">Plate: ${driverData.plate}</p>
        <button class="close-btn" style="background-color: #ed850e; color: #FFFFFF; border: none; border-radius: 5px; padding: 10px 20px; cursor: pointer; position: absolute; bottom: 10px; left: 10px;" onclick="closeDialog()">Close</button>
      </div>
    `;
    dialog.className = 'dialog';

    const style = document.createElement('style');
    style.innerHTML = `
      .dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        max-width: 95%;
        width: 900px;
        max-height: 80%;
        overflow: hidden;
        padding: 10px;
      }
      .dialog-content {
        padding: 20px;
        max-height: 70vh;
        overflow-y: auto;
      }
      .image-container {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .image-container img {
        border-radius: 10px;
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(dialog);
  });
}

// Get a reference to both exit buttons
const exitButtons = document.querySelectorAll('.close');

// Add an event listener to both exit buttons
exitButtons.forEach((button) => {
  button.addEventListener('click', () => {
    // Hide the modal that contains the button
    $(button.closest('.modal')).modal('hide');
  });
});

document.getElementById('add-account-btn').addEventListener('click', () => {
  $('#create-account-modal').modal('show');
});

// Get a reference to the create account form
const createAccountForm = document.getElementById('create-account-form');

// Add an event listener to the account type select field
document.getElementById('account-type').addEventListener('change', (e) => {
  const accountType = e.target.value;
  if (accountType === 'driver') {
    document.getElementById('plate-group').style.display = 'block';
  } else {
    document.getElementById('plate-group').style.display = 'none';
  }
});

// Add an event listener to the create account form
createAccountForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get the values from the form fields
  const accountType = document.getElementById('account-type').value;
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const plate = document.getElementById('plate').value;
  const password = document.getElementById('password').value;

  // Check if the form fields are empty
  if (name === '' || email === '' || phone === '' || password === '') {
    alert('Please fill in all the required fields.');
    return;
  }

  // Create a new account using Firebase Authentication
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Get the user's ID token
      var user = userCredential.user;
      console.log("Account created successfully!");

      // Create a new account node in the Firebase Realtime Database
      const newAccountRef = accountType === 'user' ? usersRef.child(user.uid) : driversRef.child(user.uid);

      // Add the account information to the new account node
      newAccountRef.set({
        name: name,
        email: email,
        phone: phone,
        plate: plate,
        blockedStatus: 'No',
        id: user.uid,
      })
        .then(() => {
          // Show a success message
          alert('Account created successfully!');

          // Clear the form fields
          document.getElementById('name').value = '';
          document.getElementById('email').value = '';
          document.getElementById('phone').value = '';
          document.getElementById('plate').value = '';
          document.getElementById('password').value = '';

          // Hide the create account modal
          $('#create-account-modal').modal('hide');
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log("Error writing account data:", errorCode, errorMessage);
          alert('Error creating account: ' + errorMessage);
        });
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log("Error creating account:", errorCode, errorMessage);
      if (errorCode === 'auth/email-already-in-use') {
        alert('The email address is already in use. Please try a different email address.');
      } else {
        alert('Error creating account: ' + errorMessage);
      }
    });
});


function updateBlockedStatusDriver(uid) {
  const blockedStatus = document.getElementById(`blocked-status-${uid}`).value;
  const driverRef = database.ref(`drivers/${uid}`);
  driverRef.update({ blockedStatus: blockedStatus });
}

function closeDialog() {
  const dialog = document.querySelector('.dialog');
  dialog.remove();
}

// Create a new log entry when a user account is created
usersRef.on('child_added', (userSnapshot) => {
  const userKey = userSnapshot.key;
  const userData = userSnapshot.val();
  const logData = {
    date: new Date().toISOString(),
    event: 'User account created',
    details: `User ${userData.name} (${userData.email}) created`
  };
  logsRef.push(logData);
});

// Create a new log entry when a driver account is created
driversRef.on('child_added', (driverSnapshot) => {
  const driverKey = driverSnapshot.key;
  const driverData = driverSnapshot.val();
  const logData = {
    date: new Date().toISOString(),
    event: 'Driver account created',
    details: `Driver ${driverData.name} (${driverData.email}) created`
  };
  logsRef.push(logData);
});

function createAdminNode() {
  const username = document.getElementById('exampleInputUsername1').value;
  const email = document.getElementById('exampleInputEmail1').value;
  const password = document.getElementById('exampleInputPassword1').value;
  const adminRef = database.ref('admin');
  const newAdminRef = adminRef.push();

  // Add the admin information to the new admin node
  newAdminRef.set({
    uid: newAdminRef.key,
    username: username,
    email: email,
    password: password
  });

  localStorage.setItem('email', email);
  localStorage.setItem('username', username);

  alert('Admin created successfully!');
  window.location.href = 'index.html';
}

function loginAdmin() {
  const email = document.getElementById('exampleInputEmail1').value;
  const password = document.getElementById('exampleInputPassword1').value;

  const adminRef = database.ref('admin');

  adminRef.once('value', (data) => {
    data.forEach((admin) => {
      if (admin.val().email === email && admin.val().password === password) {

        // Store the username and email in localStorage
        localStorage.setItem('email', admin.val().email);
        localStorage.setItem('username', admin.val().username);

        alert('Login successful!');
        window.location.href = 'index.html';
      }
    });
  });
}