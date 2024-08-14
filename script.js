document.addEventListener('DOMContentLoaded', () => {
    class Party {
        constructor(date, description, location) {
            this.date = date;
            this.description = description;
            this.location = location;
        }
    }

    class PartyManager {
        constructor() {
            this.parties = JSON.parse(localStorage.getItem('parties')) || [];
            this.partyTable = document.getElementById('party-table').getElementsByTagName('tbody')[0];
            this.partyForm = document.getElementById('party-form');
            this.init();
        }

        async init() {
            await this.fetchPartiesFromServerJSON();
            // await this.fetchPartiesFromServerXML();
            this.displayParties();
            this.partyForm.addEventListener('submit', (event) => this.addParty(event));
        }

        async fetchPartiesFromServerJSON() {
            try {
                const response = await fetch('parties.json');
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                const data = await response.json();
                this.parties = data.map(party => new Party(party.date, party.description, party.location));
                this.sortParties();
                localStorage.setItem('parties', JSON.stringify(this.parties));
                this.displayParties();
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        }
        async fetchPartiesFromServerXML() {
            try {
                const response = await fetch('parties.xml');
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                const text = await response.text();
                const parser = new DOMParser();
                const xml = parser.parseFromString(text, 'application/xml');
                const parties = Array.from(xml.querySelectorAll('party')).map(party => ({
                    date: party.querySelector('date').textContent,
                    description: party.querySelector('description').textContent,
                    location: party.querySelector('location').textContent
                }));
                this.parties = parties.map(party => new Party(party.date, party.description, party.location));
                this.sortParties();
                localStorage.setItem('parties', JSON.stringify(this.parties));
                this.displayParties();
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        }

        displayParties() {
            this.partyTable.innerHTML = '';
            this.parties.forEach((party, index) => {
                const row = this.partyTable.insertRow();
                row.insertCell(0).innerText = party.date;
                row.insertCell(1).innerText = party.description;
                row.insertCell(2).innerText = party.location;
                const actionsCell = row.insertCell(3);
                const deleteButton = document.createElement('button');
                deleteButton.innerText = 'Löschen';
                deleteButton.onclick = () => this.deleteParty(index);
                actionsCell.appendChild(deleteButton);
            });
        }

        async addParty(event) {
            event.preventDefault();
            const date = this.partyForm.elements['date'].value;
            const description = this.partyForm.elements['description'].value;
            const location = this.partyForm.elements['location'].value;
        
            if (new Date(date) < new Date()) {
                alert('Das Datum muss in der Zukunft liegen.');
                return;
            }
        
            const newParty = new Party(date, description, location);
            this.parties.push(newParty);
            this.sortParties();
            this.displayParties();
            localStorage.setItem('parties', JSON.stringify(this.parties));
        
            try {
                const addedParty = await this.simulateServerPost(newParty);
                console.log('Party added on server and local:', addedParty);
            } catch (error) {
                console.error('Error adding party:', error);
            }
        
            this.partyForm.reset();
        }
        
        async simulateServerPost(newParty) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log('Simulating POST request to server:', newParty);
                    resolve(newParty);
                }, 1000);
            });
        }
        

        async deleteParty(index) {
            const deletedParty = this.parties.splice(index, 1);
            this.sortParties();
            localStorage.setItem('parties', JSON.stringify(this.parties));
            this.displayParties();
        
            try {
                await this.simulateServerDelete(deletedParty[0]);
                console.log('Party deleted from server and local:', deletedParty[0]);
            } catch (error) {
                console.error('Error deleting party:', error);
            }
        }
        
        async simulateServerDelete(deletedParty) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve("Party deleted successfully" );
                    console.log('Simulating DELETE request to server:', deletedParty);
                    
                }, 1000);
            });
        }
        

        sortParties() {
            this.parties.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
    }

    new PartyManager();
});
