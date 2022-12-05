## This is a full stack web project for research purpose

### Website Link：https://image-search.azurewebsites.net/
#### Developed by Bryan Jia, with help from of Tony, and Nick.

### For test purpose, please use the tester ID "Bryan" to log in!
The webpage need to be viewed in full screen!

This app tries to measure testers' acquisition of clinical visual search skill with or without the help of AI assistant.

Use cases:
1. If the user tries to log in with a invalid user id, the user will be rejected.
2. When the user logged in with valid user id, the user will be remembered (does not need to re-login) for a while.
3. Test images were shown to the user. The user can mark places of anormaly on the image by clicking on add new, and in the right panel, the user can select the type of the anomaly and user's confidence level associated with it.
4. The dropdowns at bottom right ask the user about the confidence level of how much they believe a type of anomaly does not exisit in the image. And if they selected certain types of anomaly before, they corresponding dropdown would be disabled.
5. When the user click on submit after finishing marking the image(of no mark needed) and selecting confidence levels from the dropdowns(must be done), or the time runs out, the image with simulated AI feedback would show up. And the user can choose to change or keep their answers. After that, the next image will be shown. 
6. After 6 image, a performance measurement graph with performance statistics will show up.
7. A session contains 12 graphs.
