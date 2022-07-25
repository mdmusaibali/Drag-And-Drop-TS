"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        else {
            this.instance = new ProjectState();
            return this.instance;
        }
    }
    addProject(title, description, numOfPeople) {
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active);
        this.projects.push(newProject);
        this.updateListeners();
    }
    switchStatus(projectId, newStatus) {
        const project = this.projects.find((prj) => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }
    updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn([...this.projects]);
        }
    }
}
const projectState = ProjectState.getInstance();
function validate(validatableInput) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (validatableInput.minLength != null &&
        typeof validatableInput.value === "string") {
        isValid =
            isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (validatableInput.maxLength != null &&
        typeof validatableInput.value === "string") {
        isValid =
            isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (validatableInput.min != null &&
        typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (validatableInput.max != null &&
        typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}
//Validation
//126-E
//124-S
//AutoBind Decorator
function AutoBind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const adjustedDescriptor = {
        configurable: true,
        enumerable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjustedDescriptor;
}
//AutoBind Decorator
//124-E
//131-S
class Component {
    constructor(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        const importedHTMLContent = document.importNode(this.templateElement.content, true);
        this.element = importedHTMLContent.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtBeginning) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? "afterbegin" : "beforeend", this.element);
    }
}
//131-E
class ProjectItem extends Component {
    constructor(hostId, project) {
        super("single-project", hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    get persons() {
        if (this.project.people === 1) {
            return "1 person";
        }
        else {
            return `${this.project.people} persons`;
        }
    }
    dragStartHandler(event) {
        event.dataTransfer.setData("text/plain", this.project.id);
        event.dataTransfer.effectAllowed = "move";
    }
    dragEndHandler(_) {
        // console.log("DragEnd");
    }
    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandler);
        this.element.addEventListener("dragend", this.dragEndHandler);
    }
    renderContent() {
        this.element.querySelector("h2").textContent = this.project.title;
        this.element.querySelector("h3").textContent = this.persons + " assigned";
        this.element.querySelector("p").textContent = this.project.description;
    }
}
__decorate([
    AutoBind
], ProjectItem.prototype, "dragStartHandler", null);
__decorate([
    AutoBind
], ProjectItem.prototype, "dragEndHandler", null);
//127-S
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }
    dragOverHandler(event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault();
            const listEl = this.element.querySelector("ul");
            listEl.classList.add("droppable");
        }
    }
    dropHandler(event) {
        const prjId = event.dataTransfer.getData("text/plain");
        projectState.switchStatus(prjId, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished);
    }
    dragLeaveHandler(event) {
        const listEl = this.element.querySelector("ul");
        listEl.classList.remove("droppable");
    }
    configure() {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);
        this.element.addEventListener("drop", this.dropHandler);
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter((prj) => {
                if (this.type === "active") {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });
            this.assignedProjects = relevantProjects;
            this.renderProject();
        });
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent =
            this.type.toUpperCase() + " PROJECT";
    }
    //128-S
    renderProject() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        listEl.innerHTML = "";
        for (const prjItem of this.assignedProjects) {
            //prjItem is Project class objects
            //(ul)!.id is active-project-list
            new ProjectItem(this.element.querySelector("ul").id, prjItem);
        }
    }
}
__decorate([
    AutoBind
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    AutoBind
], ProjectList.prototype, "dropHandler", null);
__decorate([
    AutoBind
], ProjectList.prototype, "dragLeaveHandler", null);
//127-E
class ProjectInput extends Component {
    //123-E
    constructor() {
        super("project-input", "app", true, "user-input");
        //123-S
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.peopleInputElement = this.element.querySelector("#people");
        this.configure();
        //123-E
    }
    configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }
    //125-S
    gatherUserInput() {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        //126-S
        const titleValidatable = {
            value: enteredTitle,
            required: true,
        };
        const descriptionValidatable = {
            value: enteredDescription,
            required: true,
            minLength: 5,
        };
        const peopleValidatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5,
        };
        //126-E
        if (!validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)) {
            alert("Invalid input");
            return;
        }
        else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }
    //125-E
    //123-S
    clearInputs() {
        this.descriptionInputElement.value = "";
        this.titleInputElement.value = "";
        this.peopleInputElement.value = "";
    }
    submitHandler(e) {
        e.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            this.clearInputs();
        }
    }
    renderContent() { }
}
__decorate([
    AutoBind
], ProjectInput.prototype, "submitHandler", null);
const prjInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
//# sourceMappingURL=index.js.map