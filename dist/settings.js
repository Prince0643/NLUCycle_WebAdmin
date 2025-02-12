// Backup data function
function backupData() {
    // Get a reference to the database
    const database = firebase.database();

    // Get a reference to the users and drivers nodes
    const usersRef = database.ref('users');
    const driversRef = database.ref('drivers');

    // Use the once() method to read the data from the nodes
    usersRef.once('value', (usersSnapshot) => {
        const usersData = usersSnapshot.val();

        // Convert the users data to a JSON string
        const usersJson = JSON.stringify(usersData);

        // Create a blob with the users data
        const usersBlob = new Blob([usersJson], { type: 'application/json' });

        // Create a link to download the users data
        const usersLink = document.createElement('a');
        usersLink.href = URL.createObjectURL(usersBlob);
        usersLink.download = 'users.json';
        usersLink.click();

        // Use the once() method to read the data from the drivers node
        driversRef.once('value', (driversSnapshot) => {
            const driversData = driversSnapshot.val();

            // Convert the drivers data to a JSON string
            const driversJson = JSON.stringify(driversData);

            // Create a blob with the drivers data
            const driversBlob = new Blob([driversJson], { type: 'application/json' });

            // Create a link to download the drivers data
            const driversLink = document.createElement('a');
            driversLink.href = URL.createObjectURL(driversBlob);
            driversLink.download = 'drivers.json';
            driversLink.click();

            // Display success alert
            document.getElementById("backup-data-alert").style.display = "block";
        });
    });
}

// Add event listeners to the buttons
document.getElementById('backup-data-btn').addEventListener('click', backupData);

document.getElementById('upload-data-btn').addEventListener('click', function () {
    const fileInput = document.getElementById('upload-json');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a JSON file to upload.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const jsonData = JSON.parse(event.target.result);
            const usersRef = database.ref('users');
            const driversRef = database.ref('drivers');

            const uploadPromises = [];

            if (jsonData.users) {
                Object.keys(jsonData.users).forEach(userId => {
                    const userPromise = usersRef.child(userId).set(jsonData.users[userId]);
                    uploadPromises.push(userPromise);
                });
            }

            if (jsonData.drivers) {
                Object.keys(jsonData.drivers).forEach(driverId => {
                    const driverPromise = driversRef.child(driverId).set(jsonData.drivers[driverId]);
                    uploadPromises.push(driverPromise);
                });
            }

            // Wait for all uploads to complete
            Promise.all(uploadPromises)
                .then(() => {
                    document.getElementById('upload-data-alert').style.display = 'block';
                    document.getElementById('upload-data-error').style.display = 'none';
                })
                .catch(error => {
                    console.error('Error uploading data:', error);
                    document.getElementById('upload-data-error').style.display = 'block';
                    document.getElementById('upload-data-alert').style.display = 'none';
                });
        } catch (error) {
            console.error('Error parsing JSON:', error);
            document.getElementById('upload-data-error').style.display = 'block';
            document.getElementById('upload-data-alert').style.display = 'none';
        }
    };

    reader.readAsText(file);
});