
const { Octokit } = require("octokit");
const dotenv = require("dotenv");
dotenv.config()

const octokit = new Octokit({ auth: process.env.TOKEN });

const defaults = [
    {
        name: '0. WIP π¨βπ»',
        color: '572800',
        description: 'work in progress'
    },
    {
        name: 'κΈ°λ₯κ°μ  π',
        color: 'a2eeef',
        description: 'new feature or improvement'
    },
    {
        name: 'κΈ°λ₯κ΅¬ν π',
        color: 'c2e0c6',
        description: 'new functionality'
    },
    {
        name: 'λμμμ²­ β', // help wanted
        color: '008672',
        description: 'Extra attention is needed'
    },
    {
        name: 'λ¬Έμν π',
        color: '0075ca',
        description: 'Improvements or additions to documentation'
    },
    {
        name: 'λ²κ·Έ π',
        color: 'd73a4a',
        description: "Something isn't working"
    },
    {
        name: 'λΆκ°λ₯ π',
        color: 'e4e669',
        description: "This doesn't seem right"
    },
    {
        name: 'μ€λ¨ β',
        color: 'ffffff',
        description: 'This will not be worked on'
    },
    {
        name: 'μ€λ³΅ β»οΈ',
        color: 'cfd3d7',
        description: 'This issue or pull request already exists'
    },
    {
        name: 'μ§λ¬Έ β',
        color: 'd876e3',
        description: 'Further information is requested'
    },
    {
        name: 'μ²μ μ¨ μ¬λμ μν π€',
        color: '7057ff',
        description: 'Good for newcomers'
    }
];


const patchMap = {
    'enhancement': defaults[1],
    'help wanted': defaults[3],
    'documentation': defaults[4],
    'bug': defaults[5],
    'invalid': defaults[6],
    'wontfix': defaults[7],
    'duplicate': defaults[8],
    'question': defaults[9],
    'good first issue': defaults[10]
};

const postList = [
    defaults[0], defaults[2],
];

(async () => {
    // get labels of repo
    const response = await octokit.request('GET /repos/{owner}/{repo}/labels', {
        owner: process.env.OWNER,
        repo: process.env.REPO,
    })
    const originalLables = response.data;
    // patch previous labels
    for (let i = 0; i < originalLables.length; i++) {
        const labelName = originalLables[i].name;
        const dataWillBeChanged = patchMap[labelName]
        if (dataWillBeChanged) {
            console.log(labelName + 'is patching as: ');
            try {
                const patched = await octokit.request(`PATCH /repos/{owner}/{repo}/labels/${labelName.replace(/\s/g, '%20')}`, {
                    owner: process.env.OWNER,
                    repo: process.env.REPO,
                    ...dataWillBeChanged
                })
                console.log(patched.data)
                console.log('and patched!')
            } catch (e) {
                console.log('An error occured while the label: ' + labelName  + ' patched.')
            } finally {
                console.log('\n')
            }
        }
    }

    const alreadyExists = (targetLabelName) => {
        for (let j = 0; j < originalLables.length; j++) {
            const labelName = originalLables[j].name;
            if (targetLabelName === labelName) {
                return true;
            }
        }
        return false;
    }

    // post new customized labels;
    for (let i = 0; i < postList.length; i++) {
        const newLabelData = postList[i];
        if (alreadyExists(newLabelData.name)) {
            console.log(`The new label ${newLabelData.name} already exists.`)
            continue
        }
        try {

            const posted = await octokit.request(`POST /repos/{owner}/{repo}/labels`, {
                owner: process.env.OWNER,
                repo: process.env.REPO,
                ...newLabelData
            })
            console.log(`The new label ${newLabelData.name} was set as:`)
            console.log(posted.data)
        } catch (e) {
            console.log('An error occured while the label: ' + newLabelData.name  + ' created.')
        } finally {
            console.log('\n')
        }
    }
})()

