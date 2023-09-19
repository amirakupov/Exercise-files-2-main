
/* A builder class to simplify the task of creating HTML elements */
class ElementCreator {
    constructor(tag) {
        this.element = document.createElement(tag);
    }

    id(id) {
        this.element.id = id;
        return this;
    }

    class(clazz) {
        this.element.class = clazz;
        return this;
    }

    text(content) {
        this.element.innerHTML = content;
        return this;
    }

    with(name, value) {
        this.element.setAttribute(name, value)
        return this;
    }

    listener(name, listener) {
        this.element.addEventListener(name, listener)
        return this;
    }

    append(child) {
        child.appendTo(this.element);
        return this;
    }

    prependTo(parent) {
        parent.prepend(this.element);
        return this.element;
    }

    appendTo(parent) {
        parent.append(this.element);
        return this.element;
    }

    insertBefore(parent, sibling) {
        parent.insertBefore(this.element, sibling);
        return this.element;
    }

    replace(parent, sibling) {
        parent.replaceChild(this.element, sibling);
        return this.element;
    }
}

/* A class representing a resource. This class is used per default when receiving the
   available resources from the server (see end of this file).
   You can (and probably should) rename this class to match with whatever name you
   used for your resource on the server-side.
 */
class Resource {

    /* If you want to know more about this form of getters, read this:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get */
    get idforDOM() {
        return `resource-${this.id}`;
    }

}

function add(resource, sibling) {

    const creator = new ElementCreator("article")
        .id(resource.idforDOM);

    /* Task 2: Instead of the name property of the example resource, add the properties of
       your resource to the DOM. If you do not have the name property in your resource,
       start by removing the h2 element that currently represents the name. For the 
       properties of your object you can use whatever html element you feel represents
       your data best, e.g., h2, paragraphs, spans, ... 
       Also, you don't have to use the ElementCreator if you don't want to and add the
       elements manually. */

    creator
        .append(new ElementCreator("h2").text(resource.name + ' ' + resource.species))     //Here you cannot add a blank space with "" symbols, you have to use the '' symbols

    creator
        .append(new ElementCreator("p").text("Age: " + resource.age))

    creator
        .append(new ElementCreator("p").text("Pet: " + resource.isPet))

    creator
        .append(new ElementCreator("button").text("Edit").listener('click', () => {
            edit(resource);
        }))
        .append(new ElementCreator("button").text("Remove").listener('click', () => {
            /* Task 3: Call the delete endpoint asynchronously using either an XMLHttpRequest
               or the Fetch API. Once the call returns successfully, remove the resource from
               the DOM using the call to remove(...) below. */

               fetch(`/api/resources/${resource.id}`, {method: "delete",})
               .then(response => {
                if (response.ok){
                    console.log("Resource successfully deleted.");
                    remove(resource);                                               // <- This call removes the resource from the DOM. Call it after (and only if) your API call succeeds!
                }else{
                    console.error("Error deleting Resource.");                      // By using the .then notation we use fetch asynchronously because it first deletes the resource on the endpoint and then on the DOM
                }
               })
               .catch(error => {
                console.error("Failed to delete Resource", error);
               });
        }));

    const parent = document.querySelector('main');

    if (sibling) {
        creator.replace(parent, sibling);
    } else {
        creator.insertBefore(parent, document.querySelector('#bottom'));
    }
        
}

function formatDate (anyStringDate){

}

function edit(resource) {
    const formCreator = new ElementCreator("form")
        .id(resource.idforDOM)
        .append(new ElementCreator("h3").text("Edit " + resource.name));
    
    /* Task 4 - Part 1: Instead of the name property, add the properties your resource has here!
       The label and input element used here are just an example of how you can edit a
       property of a resource, in the case of our example property name this is a label and an
       input field. Also, we assign the input field a unique id attribute to be able to identify
       it easily later when the user saves the edited data (see Task 4 - Part 2 below). 
    */


    formCreator
        .append(new ElementCreator("label").text("Name").with("for", "resource-name"))
        .append(new ElementCreator("input").id("resource-name").with("type", "text").with("value", resource.name));

    formCreator
        .append(new ElementCreator("label").text("Species").with("for", "resource-species"))
        .append(new ElementCreator("input").id("resource-species").with("type", "text").with("value", resource.species));

    formCreator
        .append(new ElementCreator("label").text("Age").with("for", "resource-age"))
        .append(new ElementCreator("input").id("resource-age").with("type", "number").with("value", resource.age));
        
    formCreator
        .append(new ElementCreator("label").text("isPet").with("for", "resource-isPet"))
        .append(new ElementCreator("input").id("resource-isPet").with("type", "checkbox"));


    /* In the end, we add the code to handle saving the resource on the server and terminating edit mode */
    formCreator
        .append(new ElementCreator("button").text("Speichern").listener('click', (event) => {
            /* Why do we have to prevent the default action? Try commenting this line. */
            event.preventDefault();

            /* The user saves the resource.
               Task 4 - Part 2: We manually set the edited values from the input elements to the resource object. 
               Again, this code here is just an example of how the name of our example resource can be obtained
               and set in to the resource. The idea is that you handle your own properties here.
            */
            resource.name = document.getElementById("resource-name").value;
            resource.species = document.getElementById("resource-species").value;
            resource.age = document.getElementById("resource-age").value;

            const checkBoxValue = document.getElementById(resource.idforDOM).querySelector('input[type="checkbox"]').checked;

            checkBoxValue ? resource.isPet = true : resource.isPet = false;  
            


            /* Task 4 - Part 3: Call the update endpoint asynchronously. Once the call returns successfully,
               use the code below to remove the form we used for editing and again render 
               the resource in the list.
            */

               fetch(`/api/resources/${resource.id}`, {
                method: "put",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(resource)
            })
               .then(response => {
                if (response.ok){
                    console.log("Resource successfully updated.");
                    add(resource, document.getElementById(resource.idforDOM));  // <- Call this after the resource is updated successfully on the server
                }else{
                    console.error("Error updating Resource.");                      
                }
               })
               .catch(error => {
                console.error("Failed to update Resource", error);
               });
        }))
        .replace(document.querySelector('main'), document.getElementById(resource.idforDOM));
        const parentElement = document.getElementById(resource.idforDOM);
        parentElement.querySelector('input[type="checkbox"]').checked = resource.isPet;              //Here we coded this line in order for the checkbox to stay checked if the value is true and prevent it from reseting
}

function remove(resource) {
    document.getElementById(resource.idforDOM).remove();
}

/* Task 5 - Create a new resource is very similar to updating a resource. First, you add
   an empty form to the DOM with the exact same fields you used to edit a resource.
   Instead of PUTing the resource to the server, you POST it and add the resource that
   the server returns to the DOM (Remember, the resource returned by the server is the
    one that contains an id).
 */

function create() {

    const animal = new Resource();

    const formCreator = new ElementCreator("form")
        .id(animal.idforDOM)
        .append(new ElementCreator("h3").text("Add New Animal"));

    formCreator
        .append(new ElementCreator("label").text("Name").with("for", "resource-name"))
        .append(new ElementCreator("input").id("resource-name").with("type", "text"));

    formCreator
        .append(new ElementCreator("label").text("Species").with("for", "resource-species"))
        .append(new ElementCreator("input").id("resource-species").with("type", "text"));

    formCreator
        .append(new ElementCreator("label").text("Age").with("for", "resource-age"))
        .append(new ElementCreator("input").id("resource-age").with("type", "number"));

    formCreator
        .append(new ElementCreator("label").text("isPet").with("for", "resource-isPet"))
        .append(new ElementCreator("input").id("resource-isPet").with("type", "checkbox"));

    // Add a save button to create the new resource
    formCreator
        .append(new ElementCreator("button").text("Save and Create").listener('click', async (event) => {
            event.preventDefault();

            // Get values from the input fields
            animal.name = document.getElementById("resource-name").value;
            animal.species = document.getElementById("resource-species").value;
            animal.age = document.getElementById("resource-age").value;

            const checkBoxValue = document.getElementById(animal.idforDOM).querySelector('input[type="checkbox"]').checked;
            animal.isPet = checkBoxValue;

            const requestData = {
                method: "POST",
                headers: {                                      //This is our data for the POST request, we basically encapsulate it
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(animal)
            };

            try {
                const response = await fetch("/api/resources", requestData);
                if (response.ok) {
                    const createdResource = await response.json();
                    add(Object.assign(new Resource(), createdResource));            //Here we make the post request to create the resource, add it to the DOM and then close the forms by removing it

                    document.getElementById(animal.idforDOM).remove();
                } else {
                    console.error("Error creating Resource.");
                }
            } catch (error) {
                console.error("Failed to create Resource", error);
            }

            document.getElementById("resource-name").value = "";
            document.getElementById("resource-species").value = "";
            document.getElementById("resource-age").value = "";                           // Every input you use also needs to be reseted, we clear the fields here
            document.getElementById(newResource.idforDOM).querySelector('input[type="checkbox"]').checked = false;
        }));

    // Adding the form to the DOM
    formCreator.appendTo(document.querySelector('main'));
}
    

document.addEventListener("DOMContentLoaded", function (event) {

    fetch("/api/resources")
        .then(response => response.json())
        .then(resources => {
            for (const resource of resources) {
                add(Object.assign(new Resource(), resource));
            }
        });
});

