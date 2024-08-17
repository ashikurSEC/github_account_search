// async function getGithubUser() {
//     const username = document.getElementById('github-username').value;
//     const url = `https://api.github.com/users/${username}`;
    
//     try {
//         const response = await fetch(url);
//         if (!response.ok) throw new Error('User not found');
//         const data = await response.json();
        
//         document.getElementById('user-details').style.display = 'block';
//         document.getElementById('user-details').innerHTML = `

//             <img src="${data.avatar_url}" alt="${data.login}" width="100">
//             <h2>${data.name || data.login}</h2>
//             <p>${data.bio || "Not Bio Available!"}</p>

//             <div class="stats">
//                 <div><h3>${data.public_repos}</h3><p>Repositories</p></div>
//                 <div><h3>${data.followers}</h3><p>Followers</p></div>
//                 <div><h3>${data.following}</h3><p>Following</p></div>
//             </div>

//             <a href="${data.html_url}" class="glass_btn" target="_blank">View Profile</a>
//         `;
//     } catch (error) {
//         alert(error.message);
//     }
// }


async function getGithubUser() {

    const username = document.getElementById('github-username').value;
    const url = `https://api.github.com/users/${username}`;

    try {
        const response = await fetch (url);

        if ( !response.ok ) {
            throw new Error('User not found');
        }

        const data = await response.json();

        document.getElementById('user-details').style.display = 'block';

        document.getElementById('user-details').innerHTML = `
        
        <img src="${data.avatar_url}" alt="${data.login}" width="100">
        <h2>${data.name || data.login}</h2>
        <p>${data.bio || "Not bio available"}</p>
        
        <div class="stats">
            <div><h3>${data.public_repos}</h3><p>Repositories</p></div>
            <div><h3>${data.followers}</h3><p>Followers</p></div>
            <div><h3>${data.following}</h3><p>Following</p></div>
        </div>
        
        <a href="${data.html_url}" class="glass_btn" target="_blank">View Profile</a>
        
        `;
    }

    catch ( error ) 
    {
        alert(error.message);
    }
}